const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function serialize(row) {
  return { ...row, subjects: JSON.parse(row.subjects) };
}

// GET /api/rollslips  (admin: all; student: own only)
router.get("/", requireAuth, (req, res) => {
  let sql = "SELECT * FROM roll_slips WHERE 1=1";
  const params = [];

  if (req.user.role === "student") {
    sql += " AND studentId = ?";
    params.push(req.user.studentId);
  }

  sql += " ORDER BY id DESC";

  res.json(db.prepare(sql).all(...params).map(serialize));
});

// POST /api/rollslips  (admin only)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { studentId, examName, examDate, subjects } = req.body;

  if (!studentId || !examName || !examDate || !Array.isArray(subjects) || !subjects.length) {
    return res.status(400).json({ error: "Please complete all fields to generate a slip." });
  }

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  if (!student) return res.status(404).json({ error: "Student not found." });

  const generatedDate = new Date().toISOString().slice(0, 10);

  const info = db.prepare(`
    INSERT INTO roll_slips (studentId, examName, examDate, subjects, generatedDate)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentId, examName, examDate, JSON.stringify(subjects), generatedDate);

  const created = db.prepare("SELECT * FROM roll_slips WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(serialize(created));
});

module.exports = router;
