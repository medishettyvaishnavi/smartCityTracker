import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

// GET /api/admin/admins
// Get admins available for complaint assignment
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email")
      .sort({ name: 1 });

    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admins",
      error: error.message,
    });
  }
};

// GET /api/admin/complaints
// Get all complaints with optional filtering
export const getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
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
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// GET /api/admin/stats
// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: "pending" });
    const inProgressComplaints = await Complaint.countDocuments({ status: "in-progress" });
    const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" });

    res.status(200).json({
      total: totalComplaints,
      pending: pendingComplaints,
      inProgress: inProgressComplaints,
      resolved: resolvedComplaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// PUT /api/admin/complaints/:id/status
// Update complaint status and admin note
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ["pending", "in-progress", "resolved", "rejected"];

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid complaint status" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (status) complaint.status = status;
    if (adminNote !== undefined) complaint.adminNote = adminNote;

    const updated = await complaint.save();
    await updated.populate("user", "name email");
    await updated.populate("assignedTo", "name email");

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint",
      error: error.message,
    });
  }
};

// PUT /api/admin/complaints/:id/assign
// Assign or unassign a complaint to an admin
export const assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (assignedTo) {
      const admin = await User.findOne({ _id: assignedTo, role: "admin" });
      if (!admin) {
        return res.status(400).json({ message: "A valid admin is required" });
      }
    }

    complaint.assignedTo = assignedTo || null;
    const updated = await complaint.save();
    await updated.populate("user", "name email");
    await updated.populate("assignedTo", "name email");

    res.status(200).json({
      message: assignedTo ? "Complaint assigned successfully" : "Complaint unassigned successfully",
      complaint: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign complaint",
      error: error.message,
    });
  }
};
