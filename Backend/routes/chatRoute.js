import express from "express";
//import { verifyTokenOptional, requireAuth } from "../middlewares/auth.js";
import { getThreads, getThreadById, deleteThread, createChat } from "../controllers/chatController.js";

const router = express.Router();

router.get("/thread", getThreads);
router.get("/thread/:threadId", getThreadById);
router.delete("/thread/:threadId", deleteThread);

// chat endpoint: require auth if you want replies to always be owned (or optional)
router.post("/chat",createChat);

export default router;
