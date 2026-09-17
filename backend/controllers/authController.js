import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createAuthResponse = (user, token) => ({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location || { city: user.city || "" },
    city: user.city || user.location?.city || "",
    phone: user.phone || "",
    pincode: user.pincode || user.location?.pincode || "",
    joinedAt: user.createdAt,
  },
});

// ==================== REGISTER ====================

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, location, city, address, phone, pincode } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Normalize location fields (support object, string, or city/address/pincode)
    let locCity = city?.trim() || "";
    let locAddress = address?.trim() || "";
    let locPincode = pincode?.trim() || "";

    if (location) {
      if (typeof location === "string") {
        locCity = locCity || location.trim();
      } else if (typeof location === "object") {
        locCity = locCity || location.city?.trim() || "";
        locAddress = locAddress || location.address?.trim() || "";
        locPincode = locPincode || location.pincode?.trim() || "";
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      location: {
        city: locCity,
        address: locAddress,
        pincode: locPincode,
      },
      city: locCity,
      phone: phone?.trim() || "",
      pincode: locPincode,
    });

    // Send response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        city: user.city || user.location?.city || "",
        phone: user.phone || "",
        pincode: user.pincode || user.location?.pincode || "",
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


// ==================== LOGIN ====================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location || { city: user.city || "" },
        city: user.city || user.location?.city || "",
        phone: user.phone || "",
        pincode: user.pincode || user.location?.pincode || "",
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==================== CURRENT USER PROFILE ====================

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location || { city: user.city || "" },
        city: user.city || user.location?.city || "",
        phone: user.phone || "",
        pincode: user.pincode || user.location?.pincode || "",
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

export const getCurrentUser = getMe;

// ==================== UPDATE USER PROFILE / LOCATION ====================

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { name, location, city, address, phone, pincode } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    let locCity = city;
    let locAddress = address;
    let locPincode = pincode;

    if (location) {
      if (typeof location === "string") {
        locCity = locCity || location.trim();
      } else if (typeof location === "object") {
        locCity = locCity || location.city?.trim();
        locAddress = locAddress || location.address?.trim();
        locPincode = locPincode || location.pincode?.trim();
      }
    }

    if (!user.location) {
      user.location = {};
    }

    if (locCity !== undefined) {
      user.city = locCity;
      user.location.city = locCity;
    }
    if (locAddress !== undefined) {
      user.location.address = locAddress;
    }
    if (locPincode !== undefined) {
      user.pincode = locPincode;
      user.location.pincode = locPincode;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        city: user.city || user.location?.city || "",
        phone: user.phone || "",
        pincode: user.pincode || user.location?.pincode || "",
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: "Google sign-in is not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: "Google account email could not be verified" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (user?.role === "admin") {
      return res.status(403).json({ message: "Use administrator sign in for admin accounts" });
    }
    if (!user) {
      const name = payload.name?.trim() || payload.email.split("@")[0];
      user = await User.create({
        name,
        email: payload.email.toLowerCase(),
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
        role: "citizen",
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json(createAuthResponse(user, token));
  } catch (error) {
    res.status(401).json({ message: "Google sign-in failed", error: error.message });
  }
};