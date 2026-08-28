const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireAuth, requireAdmin, requireSelfOrAdmin } = require("../middleware/auth");

const router = express.Router();

function stripPassword(s) {
  const { passwordHash, ...rest } = s;
  return rest;
}

// GET /api/students  (admin only — full list)
router.get("/", requireAuth, requireAdmin, (req, res) => {
  const { className, search } = req.query;

  let sql = "SELECT * FROM students WHERE 1=1";
  const params = [];

  if (className && className !== "all") {
    sql += " AND className = ?";
    params.push(className);
  }

  if (search) {
    sql += " AND (name LIKE ? OR rollNo LIKE ? OR studentId LIKE ? OR loginId LIKE ?)";
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  sql += " ORDER BY id DESC";

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(stripPassword));
});

// GET /api/students/:id  (self or admin)
router.get("/:id", requireAuth, requireSelfOrAdmin(req => req.params.id), (req, res) => {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found." });
  res.json(stripPassword(student));
});

// POST /api/students  (admin only)
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const b = req.body;

  if (!b.name || !b.fatherName || !b.className || !b.rollNo || !b.studentId || !b.loginId || !b.password) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  const dupRoll = db.prepare("SELECT id FROM students WHERE rollNo = ? AND className = ?").get(b.rollNo, b.className);
  if (dupRoll) return res.status(409).json({ error: "This roll number is already used in this class." });

  const dupSid = db.prepare("SELECT id FROM students WHERE studentId = ?").get(b.studentId);
  if (dupSid) return res.status(409).json({ error: "This Student ID is already in use." });

  const dupLogin = db.prepare("SELECT id FROM students WHERE loginId = ?").get(b.loginId);
  if (dupLogin) return res.status(409).json({ error: "This Login ID is already in use." });

  const passwordHash = bcrypt.hashSync(b.password, 10);

  const info = db.prepare(`
    INSERT INTO students (name, fatherName, className, rollNo, studentId, loginId, passwordHash, dob, gender, contact, address, admissionDate)
    VALUES (@name, @fatherName, @className, @rollNo, @studentId, @loginId, @passwordHash, @dob, @gender, @contact, @address, @admissionDate)
  `).run({
    name: b.name, fatherName: b.fatherName, className: b.className, rollNo: b.rollNo,
    studentId: b.studentId, loginId: b.loginId, passwordHash,
    dob: b.dob || null, gender: b.gender || null, contact: b.contact || null,
    address: b.address || null, admissionDate: b.admissionDate || null
  });

  const created = db.prepare("SELECT * FROM students WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(stripPassword(created));
});

// PUT /api/students/:id  (admin only)
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const id = req.params.id;
  const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Student not found." });

  const b = req.body;

  const dupRoll = db.prepare("SELECT id FROM students WHERE rollNo = ? AND className = ? AND id != ?").get(b.rollNo, b.className, id);
  if (dupRoll) return res.status(409).json({ error: "This roll number is already used in this class." });

  const dupSid = db.prepare("SELECT id FROM students WHERE studentId = ? AND id != ?").get(b.studentId, id);
  if (dupSid) return res.status(409).json({ error: "This Student ID is already in use." });

  const dupLogin = db.prepare("SELECT id FROM students WHERE loginId = ? AND id != ?").get(b.loginId, id);
  if (dupLogin) return res.status(409).json({ error: "This Login ID is already in use." });

  const passwordHash = b.password ? bcrypt.hashSync(b.password, 10) : existing.passwordHash;

  db.prepare(`
    UPDATE students SET
      name=@name, fatherName=@fatherName, className=@className, rollNo=@rollNo,
      studentId=@studentId, loginId=@loginId, passwordHash=@passwordHash,
      dob=@dob, gender=@gender, contact=@contact, address=@address, admissionDate=@admissionDate
    WHERE id=@id
  `).run({
    id, name: b.name, fatherName: b.fatherName, className: b.className, rollNo: b.rollNo,
    studentId: b.studentId, loginId: b.loginId, passwordHash,
    dob: b.dob || null, gender: b.gender || null, contact: b.contact || null,
    address: b.address || null, admissionDate: b.admissionDate || null
  });

  const updated = db.prepare("SELECT * FROM students WHERE id = ?").get(id);
  res.json(stripPassword(updated));
});

// DELETE /api/students/:id  (admin only)
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Student not found." });
  res.json({ success: true });
});

module.exports = router;
