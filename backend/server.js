import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import adminMiddleware from "./middleware/adminMiddleware.js";
import weatherRoutes from "./routes/weatherRoutes.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

dotenv.config({ path: path.join(currentDirectory, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/weather", weatherRoutes);

app.get("/api/test", (req, res) => {
  res.json({
    message: "Smart City API is working",
  });
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

app.get(
  "/api/admin/test",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    res.json({
      message: "Admin access successful",
      user: req.user,
    });
  }
);

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

