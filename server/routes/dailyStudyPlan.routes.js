import express from "express";
import { authenticateToken } from "../utils/authentication.js";
import { getPlanByDate, getTodayPlan, regeneratePlan } from "../controllers/dailyStudyPlan.controller.js";

const dailyStudyPlanRouter = express.Router();

dailyStudyPlanRouter.get("/today", authenticateToken, getTodayPlan);
dailyStudyPlanRouter.get("/", authenticateToken, getPlanByDate);
dailyStudyPlanRouter.post("/regenerate", authenticateToken, regeneratePlan);

export default dailyStudyPlanRouter;