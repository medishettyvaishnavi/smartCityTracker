import express from "express";
import {
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  getAdminUsers,
  getAdminStats,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/complaints",
  authMiddleware,
  adminMiddleware,
  getAllComplaints
);

router.put(
  "/complaints/:id/status",
  authMiddleware,
  adminMiddleware,
  updateComplaintStatus
);

router.put(
  "/complaints/:id/assign",
  authMiddleware,
  adminMiddleware,
  assignComplaint
);

router.get(
  "/admins",
  authMiddleware,
  adminMiddleware,
  getAdminUsers
);

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  getAdminStats
);

export default router;