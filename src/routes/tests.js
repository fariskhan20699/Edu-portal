const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function loadQuestions(testId, includeAnswers) {
  const rows = db.prepare("SELECT * FROM questions WHERE testId = ? ORDER BY id ASC").all(testId);
  return rows.map(q => {
    const parsed = { id: q.id, text: q.text, options: JSON.parse(q.options) };
    if (includeAnswers) parsed.correct = q.correct;
    return parsed;
  });
}

function serializeTest(test, includeAnswers) {
  return { ...test, questions: loadQuestions(test.id, includeAnswers) };
}

// GET /api/tests  (admin sees answers; students never see 'correct')
router.get("/", requireAuth, (req, res) => {
  let className = req.query.className;

  if (req.user.role === "student") {
    const student = db.prepare("SELECT className FROM students WHERE id = ?").get(req.user.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });
    className = student.className;
  }

  let sql = "SELECT * FROM tests WHERE 1=1";
  const params = [];

  if (className && className !== "all") {
    sql += " AND className = ?";
    params.push(className);
  }

  const rows = db.prepare(sql).all(...params);
  const includeAnswers = req.user.role === "admin";

  res.json(rows.map(t => serializeTest(t, includeAnswers)));
});

// GET /api/tests/:id
router.get("/:id", requireAuth, (req, res) => {
  const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(req.params.id);
  if (!test) return res.status(404).json({ error: "Test not found." });

  const includeAnswers = req.user.role === "admin";
  res.json(serializeTest(test, includeAnswers));
});

// POST /api/tests  (admin only)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const b = req.body;

  if (!b.title || !b.subject || !b.className || !b.totalMarks || !b.duration || !b.testDate) {
    return res.status(400).json({ error: "Please fill in all fields with valid values." });
  }

  const info = db.prepare(`
    INSERT INTO tests (title, subject, className, totalMarks, duration, testDate)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(b.title, b.subject, b.className, b.totalMarks, b.duration, b.testDate);

  const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(serializeTest(test, true));
});

// PUT /api/tests/:id  (admin only)
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM tests WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Test not found." });

  const b = req.body;

  db.prepare(`
    UPDATE tests SET title=?, subject=?, className=?, totalMarks=?, duration=?, testDate=?
    WHERE id=?
  `).run(b.title, b.subject, b.className, b.totalMarks, b.duration, b.testDate, req.params.id);

  const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(req.params.id);
  res.json(serializeTest(test, true));
});

// DELETE /api/tests/:id  (admin only)  -- questions cascade delete
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM tests WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Test not found." });
  res.json({ success: true });
});

// POST /api/tests/:id/questions  (admin only)
router.post("/:id/questions", requireAuth, requireAdmin, (req, res) => {
  const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(req.params.id);
  if (!test) return res.status(404).json({ error: "Test not found." });

  const { text, options, correct } = req.body;

  if (!text || !Array.isArray(options) || options.length !== 4 || options.some(o => !o)) {
    return res.status(400).json({ error: "Please fill in the question and all four options." });
  }

  if (![0, 1, 2, 3].includes(correct)) {
    return res.status(400).json({ error: "Invalid correct answer index." });
  }

  const info = db.prepare(`
    INSERT INTO questions (testId, text, options, correct) VALUES (?, ?, ?, ?)
  `).run(test.id, text, JSON.stringify(options), correct);

  res.status(201).json({ id: info.lastInsertRowid, text, options, correct });
});

// DELETE /api/tests/:testId/questions/:qId  (admin only)
router.delete("/:testId/questions/:qId", requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM questions WHERE id = ? AND testId = ?")
    .run(req.params.qId, req.params.testId);

  if (info.changes === 0) return res.status(404).json({ error: "Question not found." });
  res.json({ success: true });
});

module.exports = router;
