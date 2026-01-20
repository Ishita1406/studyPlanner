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
        const { sessionData } = req.body;
        // sessionData should include difficulty, focus, notes, topicName

        const feedback = await analyzeSession(sessionData);
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate feedback" });
    }
};
