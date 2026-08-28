const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { calculateGrade, calculateStatus } = require("../utils/grading");

const router = express.Router();

// GET /api/results  (admin: all with filters; student: own only)
router.get("/", requireAuth, (req, res) => {
  const { className, subject } = req.query;

  let sql = "SELECT * FROM results WHERE 1=1";
  const params = [];

  if (req.user.role === "student") {
    sql += " AND studentDbId = ?";
    params.push(req.user.studentId);
  } else {
    if (className && className !== "all") {
      sql += " AND className = ?";
      params.push(className);
    }
    if (subject && subject !== "all") {
      sql += " AND subject = ?";
      params.push(subject);
    }
  }

  sql += " ORDER BY id DESC";

  res.json(db.prepare(sql).all(...params));
});

// POST /api/results  (admin manually publishes a result)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const b = req.body;

  if (!b.className || !b.studentDbId || !b.testId || !b.totalMarks || b.obtainedMarks === undefined) {
    return res.status(400).json({ error: "Please complete all fields to publish a result." });
  }

  if (b.obtainedMarks > b.totalMarks) {
    return res.status(400).json({ error: "Obtained marks cannot exceed total marks." });
  }

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(b.studentDbId);
  const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(b.testId);

  if (!student || !test) return res.status(404).json({ error: "Student or test not found." });

  const percentage = Math.round((b.obtainedMarks / b.totalMarks) * 1000) / 10;
  const grade = calculateGrade(percentage);
  const status = calculateStatus(percentage);
  const date = new Date().toISOString().slice(0, 10);

  const info = db.prepare(`
    INSERT INTO results
      (studentDbId, studentName, rollNo, className, subject, testId, testName, totalMarks, obtainedMarks, percentage, grade, status, date, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Admin')
  `).run(
    student.id, student.name, student.rollNo, b.className, test.subject,
    test.id, test.title, b.totalMarks, b.obtainedMarks, percentage, grade, status, date
  );

  res.status(201).json(db.prepare("SELECT * FROM results WHERE id = ?").get(info.lastInsertRowid));
});

// POST /api/results/submit-test  (student submits a test — server grades it, ignoring any client-sent marks)
router.post("/submit-test", requireAuth, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Only students can submit tests this way." });
  }

  const { testId, answers } = req.body; // answers: { [questionId]: optionIndex }

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.user.studentId);
  const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(testId);

  if (!student || !test) return res.status(404).json({ error: "Test not found." });

  const alreadyTaken = db.prepare(
    "SELECT id FROM results WHERE studentDbId = ? AND testId = ?"
  ).get(student.id, testId);

  if (alreadyTaken) {
    return res.status(409).json({ error: "You have already submitted this test." });
  }

  const questions = db.prepare("SELECT * FROM questions WHERE testId = ?").all(testId);
  if (!questions.length) return res.status(400).json({ error: "This test has no questions yet." });

  let correctCount = 0;
  questions.forEach(q => {
    const chosen = answers ? answers[q.id] : undefined;
    if (chosen === q.correct) correctCount++;
  });

  const obtainedMarks = Math.round((correctCount / questions.length) * test.totalMarks * 100) / 100;
  const percentage = Math.round((obtainedMarks / test.totalMarks) * 1000) / 10;
  const grade = calculateGrade(percentage);
  const status = calculateStatus(percentage);
  const date = new Date().toISOString().slice(0, 10);

  const info = db.prepare(`
    INSERT INTO results
      (studentDbId, studentName, rollNo, className, subject, testId, testName, totalMarks, obtainedMarks, percentage, grade, status, date, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Student Submission')
  `).run(
    student.id, student.name, student.rollNo, student.className, test.subject,
    test.id, test.title, test.totalMarks, obtainedMarks, percentage, grade, status, date
  );

  res.status(201).json(db.prepare("SELECT * FROM results WHERE id = ?").get(info.lastInsertRowid));
});

// DELETE /api/results/:id  (admin only)
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM results WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Result not found." });
  res.json({ success: true });
});

module.exports = router;
