const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard/admin  (admin only)
router.get("/admin", requireAuth, requireAdmin, (req, res) => {
  const counts = { 3: 0, 4: 0, 5: 0, 6: 0 };

  db.prepare("SELECT className, COUNT(*) AS c FROM students GROUP BY className").all()
    .forEach(row => { if (counts[row.className] !== undefined) counts[row.className] = row.c; });

  const totalStudents = db.prepare("SELECT COUNT(*) AS c FROM students").get().c;
  const totalHomework = db.prepare("SELECT COUNT(*) AS c FROM homework").get().c;
  const totalTests = db.prepare("SELECT COUNT(*) AS c FROM tests").get().c;
  const totalResults = db.prepare("SELECT COUNT(*) AS c FROM results").get().c;

  const recentStudents = db.prepare("SELECT * FROM students ORDER BY id DESC LIMIT 5").all()
    .map(({ passwordHash, ...rest }) => rest);

  res.json({
    totalStudents, classCounts: counts, totalHomework, totalTests, totalResults, recentStudents
  });
});

// GET /api/dashboard/student  (self)
router.get("/student", requireAuth, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Student access required." });

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.user.studentId);
  if (!student) return res.status(404).json({ error: "Student not found." });

  const homeworkCount = db.prepare("SELECT COUNT(*) AS c FROM homework WHERE className = ?").get(student.className).c;
  const testsCount = db.prepare("SELECT COUNT(*) AS c FROM tests WHERE className = ?").get(student.className).c;
  const resultsCount = db.prepare("SELECT COUNT(*) AS c FROM results WHERE studentDbId = ?").get(student.id).c;

  const { passwordHash, ...safeStudent } = student;

  res.json({ student: safeStudent, homeworkCount, testsCount, resultsCount });
});

module.exports = router;
