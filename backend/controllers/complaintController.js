import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";

const CATEGORY_MAP = {
  roads: "Roads & Infrastructure",
  "roads & infrastructure": "Roads & Infrastructure",
  water: "Water Supply",
  "water supply": "Water Supply",
  electricity: "Electricity",
  sanitation: "Sanitation & Garbage",
  "sanitation & garbage": "Sanitation & Garbage",
  safety: "Public Safety",
  "public safety": "Public Safety",
  parks: "Parks & Recreation",
  "parks & recreation": "Parks & Recreation",
  noise: "Noise Pollution",
  "noise pollution": "Noise Pollution",
  other: "Other",
};

// POST /api/complaints
// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, images } =
      req.body;

    const normalizedCategory =
      CATEGORY_MAP[category?.toLowerCase()?.trim()] || category || "Other";

    let finalLocation = location;
    if (!finalLocation && (req.body.address || req.body.city)) {
      finalLocation = {
        address: req.body.address || "",
        city: req.body.city || "",
      };
    }

    const complaint = await Complaint.create({
      title,
      description,
      category: normalizedCategory,
      priority: priority || "medium",
      location: finalLocation || {},
      images: Array.isArray(images) ? images : images ? [images] : [],
      user: req.user.id,
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create complaint",
      error: error.message,
    });
  }
};

// GET /api/complaints
// Get all complaints for the logged-in user with optional status, search, and sortBy filters
export const getUserComplaints = async (req, res) => {
  try {
    const { status, search, sortBy } = req.query;
    let query = { user: req.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { "location.address": { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } },
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    }

    let complaints = await Complaint.find(query).sort(sort);

    if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      complaints = complaints.sort(
        (a, b) =>
          (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1)
      );
    }

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

// GET /api/complaints/stats
// Get aggregate statistics for the logged-in user's complaints
export const getComplaintStats = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id });

    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      inProgress: complaints.filter((c) => c.status === "in-progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
    };

    res.status(200).json({
      message: "Stats fetched successfully",
      stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};

// GET /api/complaints/:id
// Get a single complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const complaint = await Complaint.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only the owner or an admin can view the complaint
    if (
      complaint.user &&
      complaint.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ complaint });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

// PUT /api/complaints/:id
// Update a complaint (owner can edit details; admin can also update status/adminNote)
export const updateComplaint = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const isOwner = complaint.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fields any owner can update (only while still pending)
    if (isOwner && !isAdmin) {
      if (complaint.status !== "pending") {
        return res.status(400).json({
          message: "Cannot edit a complaint that is already being processed",
        });
      }
      const { title, description, category, priority, location, images } =
        req.body;
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category) {
        complaint.category =
          CATEGORY_MAP[category?.toLowerCase()?.trim()] || category;
      }
      if (priority) complaint.priority = priority;
      if (location) complaint.location = location;
      if (images) complaint.images = images;
    }

    // Additional fields admins can update
    if (isAdmin) {
      const {
        title,
        description,
        category,
        priority,
        location,
        images,
        status,
        adminNote,
      } = req.body;
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category) {
        complaint.category =
          CATEGORY_MAP[category?.toLowerCase()?.trim()] || category;
      }
      if (priority) complaint.priority = priority;
      if (location) complaint.location = location;
      if (images) complaint.images = images;
      if (status) complaint.status = status;
      if (adminNote !== undefined) complaint.adminNote = adminNote;
    }

    const updated = await complaint.save();

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

// DELETE /api/complaints/:id
// Delete a complaint (owner only, and only if still pending)
export const deleteComplaint = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const isOwner = complaint.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await complaint.deleteOne();

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
};
