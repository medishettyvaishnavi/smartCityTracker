import express from "express";
import {
	assignComplaint,
	getAdmins,
	getAllComplaints,
	getDashboardStats,
	updateComplaintStatus,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/complaints - Get all complaints with filtering
router.get("/complaints", getAllComplaints);

// GET /api/admin/admins - Get admins available for assignment
router.get("/admins", getAdmins);

// GET /api/admin/stats - Get statistics for dashboard
router.get("/stats", getDashboardStats);

// PUT /api/admin/complaints/:id/status - Update complaint status
router.put("/complaints/:id/status", updateComplaintStatus);

// PUT /api/admin/complaints/:id/assign - Assign complaint to an admin
router.put("/complaints/:id/assign", assignComplaint);

export default router;
