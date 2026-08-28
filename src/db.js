const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "home_academy.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  fatherName TEXT,
  className TEXT NOT NULL,
  rollNo TEXT NOT NULL,
  studentId TEXT NOT NULL UNIQUE,
  loginId TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  contact TEXT,
  address TEXT,
  admissionDate TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS homework (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  className TEXT NOT NULL,
  description TEXT,
  dueDate TEXT,
  link TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  className TEXT NOT NULL,
  totalMarks INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  testDate TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  testId INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options TEXT NOT NULL,      -- JSON array of 4 strings
  correct INTEGER NOT NULL    -- index 0-3
);

CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentDbId INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  studentName TEXT NOT NULL,
  rollNo TEXT,
  className TEXT NOT NULL,
  subject TEXT NOT NULL,
  testId INTEGER,
  testName TEXT,
  totalMarks REAL NOT NULL,
  obtainedMarks REAL NOT NULL,
  percentage REAL NOT NULL,
  grade TEXT NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  source TEXT DEFAULT 'Admin'
);

CREATE TABLE IF NOT EXISTS roll_slips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  examName TEXT NOT NULL,
  examDate TEXT NOT NULL,
  subjects TEXT NOT NULL,      -- JSON array of strings
  generatedDate TEXT NOT NULL
);
`);

module.exports = db;
