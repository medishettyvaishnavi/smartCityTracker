import express from "express";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", loginWithGoogle);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);

export default router;