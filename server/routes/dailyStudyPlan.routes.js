import express from "express";
import { authenticateToken } from "../utils/authentication.js";
import { getDatesWithPlans, getPlanByDate, getTodayPlan, regeneratePlan } from "../controllers/dailyStudyPlan.controller.js";

const dailyStudyPlanRouter = express.Router();

dailyStudyPlanRouter.get("/today", authenticateToken, getTodayPlan);
dailyStudyPlanRouter.get("/by-date", authenticateToken, getPlanByDate);
dailyStudyPlanRouter.post("/regenerate", authenticateToken, regeneratePlan);
dailyStudyPlanRouter.delete("/task/:topicId", authenticateToken, (await import("../controllers/dailyStudyPlan.controller.js")).removeTask);
dailyStudyPlanRouter.get('/dates', authenticateToken, getDatesWithPlans);

export default dailyStudyPlanRouter;