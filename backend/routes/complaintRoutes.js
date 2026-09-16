import express from "express";
import {
  createComplaint,
  getUserComplaints,
  getComplaintStats,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} from "../controllers/complaintController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All complaint routes require authentication
router.use(authMiddleware);

// POST   /api/complaints        → create a new complaint
router.post("/", createComplaint);

// GET    /api/complaints        → get all complaints for the logged-in user
router.get("/", getUserComplaints);

// GET    /api/complaints/stats  → get stats (must be registered before /:id)
router.get("/stats", getComplaintStats);

// GET    /api/complaints/:id    → get a single complaint by ID
router.get("/:id", getComplaintById);

// PUT    /api/complaints/:id    → update a complaint
router.put("/:id", updateComplaint);

// DELETE /api/complaints/:id    → delete a complaint
router.delete("/:id", deleteComplaint);

export default router;
