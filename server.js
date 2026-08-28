require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const studentRoutes = require("./src/routes/students");
const homeworkRoutes = require("./src/routes/homework");
const testRoutes = require("./src/routes/tests");
const resultRoutes = require("./src/routes/results");
const rollSlipRoutes = require("./src/routes/rollslips");
const dashboardRoutes = require("./src/routes/dashboard");

// Ensure DB + tables exist as soon as the server boots
require("./src/db");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/rollslips", rollSlipRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Home Academy backend running on http://localhost:${PORT}`);
});
