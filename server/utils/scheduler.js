import DailyStudyPlan from "../models/dailyStudyPlan.model.js";
import Topic from "../models/topics.model.js";
import UserProfile from "../models/userProfile.model.js";
import Subject from "../models/subject.model.js";

/**
 * Calculates priority score for a topic
 * Formula: (SubjectImportance / DaysToDeadline) * (1 - MasteryLevel) * Difficulty
 */
const calculatePriority = (topic, subject) => {
    const today = new Date();
    const examDate = subject.examDate ? new Date(subject.examDate) : new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days

    let daysToExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    daysToExam = Math.max(1, daysToExam); // Avoid division by zero

    const importance = subject.importanceLevel || 3; // Default medium importance

    // Higher priority if: Urgent deadline, Low mastery, High difficulty
    const score = (importance / daysToExam) * (1 - (topic.masteryLevel || 0)) * (1 + (topic.difficultyScore || 0.5));

    return score;
};

/**
 * Generates a Daily Study Plan for a user
 */
export const generateDailyPlan = async (userId) => {
    try {
        // 1. Fetch User Config
        const profile = await UserProfile.findOne({ user: userId });
        if (!profile) throw new Error("User profile not found");

        let availableMinutes = 120; // Default fallback
        if (profile.preferredStudyWindow) {
            const start = profile.preferredStudyWindow.startHour || 18;
            const end = profile.preferredStudyWindow.endHour || 20;
            availableMinutes = (end - start) * 60;
        }
        if (profile.maxDailyMinutes) {
            availableMinutes = Math.min(availableMinutes, profile.maxDailyMinutes);
        }

        // 2. Fetch Pending Topics
        const topics = await Topic.find({
            user: userId,
            status: { $ne: 'completed' }
        }).populate('subject');

        if (topics.length === 0) return null;

        // 3. Calculate Priorities
        const scoredTopics = topics.map(topic => ({
            topic,
            priority: calculatePriority(topic, topic.subject),
            plannedMinutes: topic.estimatedMinutes || 30 // Default slot size
        }));

        // 4. Sort by Priority
        scoredTopics.sort((a, b) => b.priority - a.priority);

        // 5. Fill the Schedule (Knapsack-ish greedy approach)
        const selectedTasks = [];
        let usedMinutes = 0;

        for (const item of scoredTopics) {
            if (usedMinutes + item.plannedMinutes <= availableMinutes) {
                selectedTasks.push({
                    topic: item.topic._id,
                    plannedMinutes: item.plannedMinutes,
                    priority: item.priority,
                    energyMatchScore: 1.0 // Placeholder for future energy matching logic
                });
                usedMinutes += item.plannedMinutes;
            }
        }

        if (selectedTasks.length === 0 && scoredTopics.length > 0) {
            // If nothing fits, take the top one anyway (overload prevention later)
            const item = scoredTopics[0];
            selectedTasks.push({
                topic: item.topic._id,
                plannedMinutes: item.plannedMinutes,
                priority: item.priority,
                energyMatchScore: 1.0
            });
            usedMinutes += item.plannedMinutes;
        }

        // 6. Save Plan
        const todayStr = new Date().toISOString().split('T')[0];

        // Overwrite existing plan for today if exists
        await DailyStudyPlan.deleteOne({ user: userId, date: todayStr });

        const plan = await DailyStudyPlan.create({
            user: userId,
            date: todayStr,
            tasks: selectedTasks,
            totalPlannedMinutes: usedMinutes
        });

        return plan;

    } catch (error) {
        console.error("Scheduler Error:", error);
        throw error;
    }
};
