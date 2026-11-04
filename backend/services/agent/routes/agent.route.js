import express from "express";
import { agent, agentStream } from "../controllers/agent.controller.js";
import multer from "../config/multer.js";

const router = express.Router();

router.post("/chat", multer.single("file"), agent);
router.post("/chat-stream", multer.single("file"), agentStream);

export default router;
