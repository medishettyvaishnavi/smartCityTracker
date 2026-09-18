import express from "express";
import { handleAssistantQuery } from "../controllers/assistantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/query", authMiddleware, handleAssistantQuery);

export default router;