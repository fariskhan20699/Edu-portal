const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/homework  (admin: all / query className; student: own class only, forced)
router.get("/", requireAuth, (req, res) => {
  let className = req.query.className;

  if (req.user.role === "student") {
    const student = db.prepare("SELECT className FROM students WHERE id = ?").get(req.user.studentId);
    if (!student) return res.status(404).json({ error: "Student not found." });
    className = student.className; // force own class
  }

  let sql = "SELECT * FROM homework WHERE 1=1";
  const params = [];

  if (className && className !== "all") {
    sql += " AND className = ?";
    params.push(className);
  }

  sql += " ORDER BY dueDate ASC";

  res.json(db.prepare(sql).all(...params));
});

// POST /api/homework  (admin only)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const b = req.body;

  if (!b.title || !b.subject || !b.className || !b.description || !b.dueDate || !b.link) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    new URL(b.link);
  } catch {
    return res.status(400).json({ error: "Please enter a valid homework link." });
  }

  const info = db.prepare(`
    INSERT INTO homework (title, subject, className, description, dueDate, link)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(b.title, b.subject, b.className, b.description, b.dueDate, b.link);

  res.status(201).json(db.prepare("SELECT * FROM homework WHERE id = ?").get(info.lastInsertRowid));
});

// PUT /api/homework/:id  (admin only)
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM homework WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Homework not found." });

  const b = req.body;

  db.prepare(`
    UPDATE homework SET title=?, subject=?, className=?, description=?, dueDate=?, link=?
    WHERE id=?
  `).run(b.title, b.subject, b.className, b.description, b.dueDate, b.link, req.params.id);

  res.json(db.prepare("SELECT * FROM homework WHERE id = ?").get(req.params.id));
});

// DELETE /api/homework/:id  (admin only)
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM homework WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Homework not found." });
  res.json({ success: true });
});

module.exports = router;
