import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// GET /api/admin/complaints
export const getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { "location.address": { $regex: searchTerm, $options: "i" } },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch all complaints",
      error: error.message,
    });
  }
};

// PUT /api/admin/complaints/:id/status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "in-progress", "resolved", "rejected"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid complaint status",
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    complaint.status = status;

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      message: "Complaint status updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
};

// PUT /api/admin/complaints/:id/assign
export const assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        message: "Assigned user ID is required",
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Verify user exists and is an admin
    const user = await User.findById(assignedTo);
    if (!user || user.role !== "admin") {
      return res.status(400).json({
        message: "Invalid assignee or assignee is not an admin",
      });
    }

    complaint.assignedTo = assignedTo;
    const updatedComplaint = await complaint.save();

    res.status(200).json({
      message: "Complaint assigned successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign complaint",
      error: error.message,
    });
  }
};

// GET /api/admin/admins
export const getAdminUsers = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin users",
      error: error.message,
    });
  }
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "pending" });
    const inProgress = await Complaint.countDocuments({ status: "in-progress" });
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const rejected = await Complaint.countDocuments({ status: "rejected" });

    res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
      rejected
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin statistics",
      error: error.message,
    });
  }
};
