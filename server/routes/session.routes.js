import express from "express";
import { logSession, getSessions } from "../controllers/session.controller.js";
import { authenticateToken } from "../utils/authentication.js";

const router = express.Router();


router.post("/", authenticateToken, logSession);
router.get("/", authenticateToken, getSessions);

export default router;
