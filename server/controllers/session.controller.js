import Session from "../models/session.model.js";
import Topic from "../models/topics.model.js";

export const logSession = async (req, res) => {
    try {
        const userId = req.user?.sub;
        const { topicId, durationMinutes, difficultyRating, focusRating, notes } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!topicId || !durationMinutes) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let session = null;
        let topic = null;

        // 1. If ratings are provided, Create the Session Log & Recalibrate
        if (difficultyRating && focusRating) {
            session = new Session({
                user: userId,
                topic: topicId,
                durationMinutes,
                difficultyRating,
                focusRating,
                notes,
            });
            await session.save();

            // 2. Recalibrate Topic
            topic = await Topic.findOne({ _id: topicId, user: userId });

            if (topic) {
                // Logic: Adjust difficulty based on rating (1-5)
                // Rating 3 = neutral. >3 means hard, <3 means easy.
                // We'll adjust the difficultyScore (0-1 range) slightly.

                let difficultyChange = 0;
                if (difficultyRating > 3) difficultyChange = 0.1; // Harder
                else if (difficultyRating < 3) difficultyChange = -0.05; // Easier

                // Update mastery: High focus + Low difficulty = mastery increase
                let masteryChange = 0;
                if (focusRating >= 4 && difficultyRating <= 3) {
                    masteryChange = 0.05;
                }

                // Apply changes, clamping between 0 and 1
                topic.difficultyScore = Math.min(Math.max(topic.difficultyScore + difficultyChange, 0), 1);
                topic.masteryLevel = Math.min(Math.max(topic.masteryLevel + masteryChange, 0), 1);

                topic.lastReviewedAt = new Date();
                await topic.save();
            }
        }

        // 3. Always Update Daily Plan Progress
        const today = new Date().toISOString().split("T")[0];
        const dailyPlan = await import("../models/dailyStudyPlan.model.js").then(m => m.default.findOne({ user: userId, date: today }));

        if (dailyPlan) {
            const task = dailyPlan.tasks.find(t => t.topic.toString() === topicId);
            if (task) {
                task.completedMinutes = (task.completedMinutes || 0) + durationMinutes;
                if (task.completedMinutes >= task.plannedMinutes) {
                    task.isCompleted = true;
                }
                await dailyPlan.save();
            }
        }

        return res.status(201).json({
            message: "Session logged successfully",
            session,
            updatedTopic: topic
        });

    } catch (error) {
        console.error("Log session error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSessions = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const sessions = await Session.find({ user: userId })
            .populate("topic", "name subject")
            .sort({ createdAt: -1 })
            .limit(20); // Limit to last 20 sessions for now

        return res.status(200).json({ sessions });
    } catch (error) {
        console.error("Get sessions error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
