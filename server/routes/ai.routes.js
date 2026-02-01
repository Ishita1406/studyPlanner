import express from "express";
import { getTopicBreakdown, getSessionFeedback, getDailyFeedback } from "../controllers/ai.controller.js";

const router = express.Router();

// POST /api/ai/breakdown
router.post("/breakdown", getTopicBreakdown);

// POST /api/ai/feedback
router.post("/feedback", getSessionFeedback);

// GET /api/ai/daily-feedback
router.get("/daily-feedback", (await import("../utils/authentication.js")).authenticateToken, getDailyFeedback);

export default router;
