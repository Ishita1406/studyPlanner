import express from "express";
import { getTopicBreakdown, getSessionFeedback } from "../controllers/ai.controller.js";

const router = express.Router();

// POST /api/ai/breakdown
router.post("/breakdown", getTopicBreakdown);

// POST /api/ai/feedback
router.post("/feedback", getSessionFeedback);

export default router;
