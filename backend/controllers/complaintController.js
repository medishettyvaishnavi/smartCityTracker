import Complaint from "../models/Complaint.js";

// POST /api/complaints
// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, images } =
      req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      location,
      images,
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
// Get all complaints for the logged-in user
export const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

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

// GET /api/complaints/:id
// Get a single complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only the owner or an admin can view the complaint
    if (
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
      if (category) complaint.category = category;
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
      if (category) complaint.category = category;
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
