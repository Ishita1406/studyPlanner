import { generateTopicBreakdown, analyzeSession } from "../services/ai.service.js";

export const getTopicBreakdown = async (req, res) => {
    try {
        const { subject, context } = req.body;
        if (!subject) {
            return res.status(400).json({ message: "Subject is required" });
        }

        const topics = await generateTopicBreakdown(subject, context);
        res.status(200).json({ topics });
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ message: "Failed to generate topics" });
    }
};

export const getSessionFeedback = async (req, res) => {
    try {
        // Fix: Use req.body directly as the client sends the flat object
        const sessionData = req.body;
        // sessionData should include difficulty, focus, notes, topicName

        const feedback = await analyzeSession(sessionData);
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate feedback" });
    }
};

export const getDailyFeedback = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // 1. Fetch today's completed sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const Session = (await import("../models/session.model.js")).default;
        const sessions = await Session.find({
            user: userId,
            createdAt: { $gte: today }
        }).populate("topic", "name subject");

        if (sessions.length === 0) {
            return res.status(200).json({
                message: "No sessions today",
                feedback: "No study sessions recorded today yet. Start a session to get feedback!",
                adjustments: []
            });
        }

        // 2. Aggregate data
        const summary = {
            totalMinutes: sessions.reduce((acc, s) => acc + s.durationMinutes, 0),
            avgFocus: sessions.reduce((acc, s) => acc + s.focusRating, 0) / sessions.length,
            topics: sessions.map(s => s.topic?.name).join(", "),
            difficulties: sessions.map(s => s.difficultyRating)
        };

        // 3. Generate Analysis
        const { analyzeDailyPerformance } = await import("../services/ai.service.js");
        const aiAnalysis = await analyzeDailyPerformance(summary);

        res.status(200).json(aiAnalysis);

    } catch (error) {
        console.error("Daily Feedback Error:", error);
        res.status(500).json({ message: "Failed to generate daily feedback" });
    }
};
