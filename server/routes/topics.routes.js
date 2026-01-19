import express from "express";
import { authenticateToken } from "../utils/authentication.js";
import { createTopic, deleteTopic, getTopics, updateTopic } from "../controllers/topics.controller.js";

const topicRouter = express.Router();

topicRouter.post("/", authenticateToken, createTopic);

topicRouter.get("/", authenticateToken, getTopics);

topicRouter.put("/:topicId", authenticateToken, updateTopic);

topicRouter.delete("/:topicId", authenticateToken, deleteTopic);

export default topicRouter;