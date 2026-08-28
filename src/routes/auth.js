const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// POST /api/auth/admin-login
router.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token, role: "admin" });
  }

  return res.status(401).json({ error: "Invalid username or password." });
});

// POST /api/auth/student-login
router.post("/student-login", (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res.status(400).json({ error: "Login ID and password are required." });
  }

  const student = db.prepare("SELECT * FROM students WHERE loginId = ?").get(loginId);

  if (!student || !bcrypt.compareSync(password, student.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = jwt.sign(
    { role: "student", studentId: student.id },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  const { passwordHash, ...safeStudent } = student;

  return res.json({ token, role: "student", student: safeStudent });
});

module.exports = router;
