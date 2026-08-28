require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

function seed() {
  const studentCount = db.prepare("SELECT COUNT(*) AS c FROM students").get().c;

  if (studentCount > 0) {
    console.log("Database already has data — skipping seed. Delete data/home_academy.db to reseed.");
    return;
  }

  const insertStudent = db.prepare(`
    INSERT INTO students
      (name, fatherName, className, rollNo, studentId, loginId, passwordHash, dob, gender, contact, address, admissionDate)
    VALUES (@name, @fatherName, @className, @rollNo, @studentId, @loginId, @passwordHash, @dob, @gender, @contact, @address, @admissionDate)
  `);

  const students = [
    {
      name: "Laiba Bibi", fatherName: "Malik Rustam Khan", className: "6",
      rollNo: "1001", studentId: "ST001", loginId: "laiba@1001", password: "laiba321",
      dob: "2014-09-12", gender: "Female", contact: "03219123757",
      address: "Shams Town Islamabad", admissionDate: "2026-04-01"
    },
    {
      name: "Noor Fatima", fatherName: "Malik Rustam Khan", className: "4",
      rollNo: "1002", studentId: "ST002", loginId: "noor@1002", password: "noor321",
      dob: "2016-05-25", gender: "Female", contact: "0302-1912375",
      address: "Shams Town Islamabad", admissionDate: "2026-04-01"
    },
    {
      name: "Mishal Khan", fatherName: "Aamir Khan", className: "6",
      rollNo: "1003", studentId: "ST003", loginId: "mishal@1003", password: "mishal321",
      dob: "2013-02-02", gender: "Female", contact: "0304-1947779",
      address: "G-6/2 Islamabad", admissionDate: "2026-04-01"
    }
  ];

  for (const s of students) {
    insertStudent.run({
      name: s.name,
      fatherName: s.fatherName,
      className: s.className,
      rollNo: s.rollNo,
      studentId: s.studentId,
      loginId: s.loginId,
      passwordHash: bcrypt.hashSync(s.password, 10),
      dob: s.dob,
      gender: s.gender,
      contact: s.contact,
      address: s.address,
      admissionDate: s.admissionDate
    });
  }

  db.prepare(`
    INSERT INTO homework (title, subject, className, description, dueDate, link)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    "Science Assignment", "Science", "6",
    "Complete the water cycle worksheet.", "2026-09-15",
    "https://drive.google.com/drive/quota"
  );

  console.log("Seed complete. Sample login: laiba@1001 / laiba321");
}

seed();
