// Imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DailyStudyPlan from "../models/dailyStudyPlan.model.js";
import Topic from "../models/topics.model.js";
import UserProfile from "../models/userProfile.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logPath = path.join(__dirname, '../scheduler_debug.txt');

function log(msg) {
    try {
        fs.appendFileSync(logPath, new Date().toISOString() + ': ' + msg + '\n');
    } catch (e) { console.error("Log failed", e); }
}

/**
 * Calculates priority score for a topic
 * Formula: (SubjectImportance / DaysToDeadline) * (1 - MasteryLevel) * Difficulty
 */
const calculatePriority = (topic, subject, currentDate) => {
    if (!subject) return 0;

    const useDefault = !subject.examDate;
    const examDate = subject.examDate ? new Date(subject.examDate) : new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Create new Date objects to avoid mutating passed dates and ensure accurate diff
    const d1 = new Date(currentDate);
    const d2 = new Date(examDate);

    let daysToExam = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    daysToExam = Math.max(0.1, daysToExam); // Avoid zero

    const importance = subject.importanceLevel || 3;
    const score = (importance / daysToExam) * (1 - (topic.masteryLevel || 0)) * (1 + (topic.difficultyScore || 0.5));

    // LOGGING PRIORITY
    log(`[Priority] Topic: ${topic.name} | Subj: ${subject.name} | Exam: ${subject.examDate || 'None'} | Days: ${daysToExam.toFixed(1)} | Score: ${score.toFixed(2)}`);

    return score;
};

/**
 * Generates a Full Study Schedule from startDate until Exam Dates or Completion
 */
export const generateFullSchedule = async (userId, startDateStr) => {
    try {
        log(`\n\n--- Generating Schedule for ${userId} starting ${startDateStr} ---`);

        // 1. Fetch User Config
        const profile = await UserProfile.findOne({ user: userId });
        if (!profile) throw new Error("User profile not found");

        let dailyMinutes = 120; // Default
        if (profile.preferredStudyWindow) {
            const start = profile.preferredStudyWindow.startHour || 18;
            const end = profile.preferredStudyWindow.endHour || 20;
            dailyMinutes = (end - start) * 60;
        }
        if (profile.maxDailyMinutes) {
            dailyMinutes = Math.min(dailyMinutes, profile.maxDailyMinutes);
        }
        log(`Daily Capacity: ${dailyMinutes}m`);

        // 2. Fetch All Pending Topics & Clean them
        let allTopics = await Topic.find({
            user: userId,
            status: { $ne: 'completed' }, // Only plan pending/active stuff
            $or: [
                { lastSkippedDate: { $exists: false } },
                { lastSkippedDate: { $lt: new Date(startDateStr) } } // Only exclude if skipped AFTER start date (which is rare), essentially include most things
            ]
        }).populate('subject');

        allTopics = allTopics.filter(t => t.subject != null);
        log(`Found ${allTopics.length} pending topics.`);

        if (allTopics.length === 0) return { plans: [], insufficientTime: false };

        // 3. Setup Simulation
        let currentDate = new Date(startDateStr);

        const pendingTopics = allTopics.map(t => ({
            ...t.toObject(),
            _id: t._id.toString()
        }));

        const generatedPlans = [];
        const revisionQueue = {}; // "YYYY-MM-DD": [topicId, topicId]

        const MAX_DAYS = 180;
        let daysSimulated = 0;
        let insufficientTime = false;

        const missingExamSubjects = new Set();

        // Loop Day by Day
        while ((pendingTopics.length > 0 || Object.keys(revisionQueue).length > 0) && daysSimulated < MAX_DAYS) {
            const dateStr = currentDate.toISOString().split('T')[0];
            let usedMinutes = 0;
            const tasks = [];

            log(`\nSimulating Day: ${dateStr}`);

            // --- A. Schedule Revisions ---
            if (revisionQueue[dateStr]) {
                for (const topicId of revisionQueue[dateStr]) {
                    const original = allTopics.find(t => t._id.toString() === topicId);
                    if (original) {
                        const examDate = original.subject.examDate ? new Date(original.subject.examDate) : null;

                        // FIX: Drop if Exam Passed OR Exam is TODAY (User requested skip on exam day)
                        if (examDate && currentDate >= examDate) {
                            log(`  [Drop Revision] ${original.name} (Exam passed/today)`);
                            continue;
                        }

                        if (usedMinutes + 20 <= dailyMinutes) {
                            tasks.push({
                                topic: original._id,
                                plannedMinutes: 20,
                                priority: 15,
                                energyMatchScore: 1,
                                isRevision: true
                            });
                            usedMinutes += 20;
                            log(`  [Revision] ${original.name} (20m)`);
                        }
                    }
                }
                delete revisionQueue[dateStr];
            }

            // --- B. Schedule New Topics ---
            const validTopics = pendingTopics.filter(t => {
                if (!t.subject.examDate) {
                    missingExamSubjects.add(t.subject.name);
                    return true;
                }
                // Skip if currentDate >= ExamDate (Don't study new topics ON exam day)
                return new Date(t.subject.examDate) > currentDate;
            });

            if (validTopics.length < pendingTopics.length) {
                // Check if dropped because of exam date (not missing date)
                const expired = pendingTopics.filter(t => t.subject.examDate && new Date(t.subject.examDate) <= currentDate);
                if (expired.length > 0) {
                    log(`  [Drop] ${expired.length} topics (Exam dates passed/today).`);
                    insufficientTime = true;
                }
            }

            // sort by priority
            const scoredTopics = validTopics.map(t => ({
                ...t,
                priority: calculatePriority(t, t.subject, currentDate)
            })).sort((a, b) => b.priority - a.priority);

            if (scoredTopics.length > 0) {
                log(`  Top Candidates: ${scoredTopics.slice(0, 3).map(t => `${t.name}(${t.priority.toFixed(2)})`).join(', ')}`);
            }

            for (let i = 0; i < scoredTopics.length; i++) {
                const item = scoredTopics[i];
                const needed = item.estimatedMinutes || 60;

                // FORCE FIT LOGIC:
                // If it fits normally OR 
                // It is the FIRST non-revision task and the day is not "full" of revisions (e.g. revisions took < 30%?) 
                // actually simpler: If we haven't scheduled any MAIN topic yet, allow Overtime.
                const hasMainTask = tasks.some(t => !t.isRevision);

                const fits = (usedMinutes + needed <= dailyMinutes);
                const forceFit = (!hasMainTask); // If no main task today, FORCE the highest priority one even if it goes over limit.

                if (fits || forceFit) {
                    tasks.push({
                        topic: item._id,
                        plannedMinutes: needed,
                        priority: item.priority || 5,
                        energyMatchScore: 1
                    });
                    usedMinutes += needed;
                    log(`  [Schedule] ${item.name} (${needed}m) ${fits ? 'Fits' : 'ForceFit'}. Total Used: ${usedMinutes}`);

                    // Remove from pending
                    const idx = pendingTopics.findIndex(pt => pt._id === item._id);
                    if (idx !== -1) pendingTopics.splice(idx, 1);

                    // Add to Revision Queue (+3 Days)
                    const revDate = new Date(currentDate);
                    revDate.setDate(revDate.getDate() + 3);
                    const revDateStr = revDate.toISOString().split('T')[0];
                    if (!revisionQueue[revDateStr]) revisionQueue[revDateStr] = [];
                    revisionQueue[revDateStr].push(item._id);

                } else {
                    log(`  [Skip] ${item.name} (${needed}m). Too big.`);
                }
            }

            if (tasks.length > 0) {
                generatedPlans.push({
                    user: userId,
                    date: dateStr,
                    tasks: tasks,
                    totalPlannedMinutes: usedMinutes
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
            daysSimulated++;
        }

        if (pendingTopics.length > 0) {
            log(`[Warning] Insufficient Time. Remaining Topics: ${pendingTopics.length}`);
            insufficientTime = true;
        }

        // 4. Save to Database
        await DailyStudyPlan.deleteMany({
            user: userId,
            date: { $gte: startDateStr }
        });

        if (generatedPlans.length > 0) {
            await DailyStudyPlan.insertMany(generatedPlans);
        }

        const todayPlan = generatedPlans.find(p => p.date === startDateStr) || null;
        let populatedPlan = null;
        if (todayPlan) {
            populatedPlan = await DailyStudyPlan.findOne({ user: userId, date: startDateStr })
                .populate("tasks.topic", "name subject");
        }

        return {
            plan: populatedPlan,
            insufficientTime,
            generatedCount: generatedPlans.length,
            missingExamSubjects: Array.from(missingExamSubjects)
        };

    } catch (error) {
        console.error("Scheduler Error:", error);
        log(`[Error] ${error.message}`);
        throw error;
    }
};

export const generateDailyPlan = async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const result = await generateFullSchedule(userId, today);
    return result.plan;
};
