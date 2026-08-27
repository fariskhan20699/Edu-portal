/* ---------------------------------------------------------------------
   1. DATA LAYER
   --------------------------------------------------------------------- */

const STORAGE_KEY = "wca_data_v1";

let students = [];
let homework = [];
let tests = [];
let results = [];
let rollSlips = [];
let currentUser = null; // { role: 'admin' } or { role: 'student', studentId: ... }

const GRADING_SCALE = [
  { min: 90, grade: "A+" },
  { min: 80, grade: "A" },
  { min: 70, grade: "B" },
  { min: 60, grade: "C" },
  { min: 50, grade: "D" },
  { min: 0, grade: "F" }
];

const PASS_PERCENT = 50;

function calculateGrade(percentage) {
  for (const band of GRADING_SCALE) {
    if (percentage >= band.min) return band.grade;
  }

  return "F";
}

function calculateStatus(percentage) {
  return percentage >= PASS_PERCENT ? "Pass" : "Fail";
}

function buildSampleData() {
  students = [
    {
      id: 1,
      name: "Laiba Bibi",
      fatherName: "Mailk Rustam Khan",
      className: "6",
      rollNo: "1001",
      studentId: "ST001",
      loginId: "laiba@1001",
      password: "laiba321",
      dob: "2014-09-12",
      gender: "Female",
      contact: "03219123757",
      address: "Shams Town Islamabad",
      admissionDate: "2026-04-01"
    },
    {
      id: 2,
      name: "Noor Fatima",
      fatherName: "Mailk Rustam Khan",
      className: "4",
      rollNo: "1002",
      studentId: "ST002",
      loginId: "noor@1002",
      password: "noor321",
      dob: "2016-05-25",
      gender: "Female",
      contact: "03021-9123757",
      address: "Shams Town Islamabad",
      admissionDate: "2026-04-01"
    },
    {
      id: 3,
      name: "Mishal Khan",
      fatherName: "Aanir Khan",
      className: "6",
      rollNo: "1003",
      studentId: "ST003",
      loginId: "mishal@1003",
      password: "mishal321",
      dob: "2013-02-02",
      gender: "Female",
      contact: "03041-9477794",
      address: "G-6/2 Islamabad",
      admissionDate: "2026-04-01"
    }
  ];

  homework = [
    {
      id: 4,
      title: "Science Assignment",
      subject: "Science",
      className: "6",
      description: "Complete the water cycle worksheet.",
      dueDate: "2026-09-15",
      link: "https://drive.google.com/drive/quota"
    },
      {
      id: 5,
      title: "Social studies",
      subject: "Science",
      className: "3",
      description: "Complete the water cycle worksheet.",
      dueDate: "2026-10-14",
      link: "https://drive.google.com/drive/quota"
    }
  ];

  tests = [
    /*
    {
      id: 1,
      title: "Mathematics Quiz",
      subject: "Mathematics",
      className: "4",
      totalMarks: 20,
      duration: 15,
      testDate: "2026-09-20",
      questions: [
        {
          id: 1,
          text: "What is 5 + 5?",
          options: ["8", "9", "10", "11"],
          correct: 2
        }
      ]
    }
    */
  ];

  results = [
    {
      id: 1,
      studentDbId: 3,
      studentName: "Ahmed Raza",
      rollNo: "201",
      className: "4",
      subject: "Mathematics",
      testId: 1,
      testName: "Mathematics Quiz",
      totalMarks: 20,
      obtainedMarks: 17,
      percentage: 85,
      grade: "A",
      status: "Pass",
      date: "2026-08-01",
      source: "Admin"
    }
  ];

  rollSlips = [];
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);

      students = parsed.students || [];
      homework = parsed.homework || [];
      tests = parsed.tests || [];
      results = parsed.results || [];
      rollSlips = parsed.rollSlips || [];

      return;
    } catch (e) {
      console.warn(
        "Could not parse saved data, rebuilding sample data.",
        e
      );
    }
  }

  buildSampleData();
  saveData();
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      students,
      homework,
      tests,
      results,
      rollSlips
    })
  );
}

function nextId(arr) {
  return arr.length
    ? Math.max(...arr.map(x => x.id)) + 1
    : 1;
}

/* ---------------------------------------------------------------------
   2. UTILITIES
   --------------------------------------------------------------------- */

function escapeHtml(str) {
  if (str === undefined || str === null) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");

    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

let confirmResolver = null;

function showConfirm(message) {
  document.getElementById("confirmMessage").textContent = message;

  document
    .getElementById("confirmOverlay")
    .classList.remove("hidden");

  return new Promise(resolve => {
    confirmResolver = resolve;
  });
}

function resolveConfirm(result) {
  document
    .getElementById("confirmOverlay")
    .classList.add("hidden");

  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;

  document
    .getElementById("modalOverlay")
    .classList.remove("hidden");
}

function closeModal() {
  document
    .getElementById("modalOverlay")
    .classList.add("hidden");

  document.getElementById("modalContent").innerHTML = "";
}

function formatDate(d) {
  if (!d) return "—";

  const dt = new Date(d + "T00:00:00");

  if (isNaN(dt.getTime())) return d;

  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

const CLASS_LABEL = c => `Class ${c}`;

/* ---------------------------------------------------------------------
   3. AUTH / SESSION
   --------------------------------------------------------------------- */

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const SESSION_KEY = "wca_session_v1";

function login(role, payload) {
  currentUser = {
    role,
    ...payload
  };

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(currentUser)
  );

  routeToApp();
}

function logout() {
  currentUser = null;

  sessionStorage.removeItem(SESSION_KEY);

  document
    .getElementById("adminApp")
    .classList.add("hidden");

  document
    .getElementById("studentApp")
    .classList.add("hidden");

  document
    .getElementById("loginScreen")
    .classList.remove("hidden");

  document.getElementById("adminLoginForm").reset();
  document.getElementById("studentLoginForm").reset();

  hideLoginError();
}

function restoreSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);

  if (!raw) return false;

  try {
    currentUser = JSON.parse(raw);
    return true;
  } catch (e) {
    return false;
  }
}

function routeToApp() {
  document
    .getElementById("loginScreen")
    .classList.add("hidden");

  if (currentUser.role === "admin") {
    document
      .getElementById("studentApp")
      .classList.add("hidden");

    document
      .getElementById("adminApp")
      .classList.remove("hidden");

    switchAdminView("dashboard");
  } else {
    document
      .getElementById("adminApp")
      .classList.add("hidden");

    document
      .getElementById("studentApp")
      .classList.remove("hidden");

    switchStudentView("dashboard");
  }
}

function showLoginError(msg) {
  const el = document.getElementById("loginError");

  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideLoginError() {
  document
    .getElementById("loginError")
    .classList.add("hidden");
}

function currentStudent() {
  if (!currentUser || currentUser.role !== "student") {
    return null;
  }

  return students.find(
    s => s.id === currentUser.studentId
  ) || null;
}

/* ---------------------------------------------------------------------
   4. NAVIGATION
   --------------------------------------------------------------------- */

function switchAdminView(view) {
  document
    .querySelectorAll("#adminNav .nav-item")
    .forEach(b => {
      b.classList.toggle(
        "active",
        b.dataset.view === view
      );
    });

  document
    .querySelectorAll("#adminContent .view")
    .forEach(v => {
      v.classList.toggle(
        "hidden",
        v.dataset.view !== view
      );
    });

  const titles = {
    dashboard: "Dashboard",
    students: "Student Register",
    homework: "Homework Management",
    tests: "Test Management",
    results: "Result Management",
    rollslips: "Roll Number Slips",
    alldata: "View All Data"
  };

  document.getElementById("adminViewTitle").textContent =
    titles[view] || "Dashboard";

  closeMobileSidebar("admin");

  if (view === "dashboard") {
    renderAdminDashboard();
  }

  if (view === "students") {
    renderStudentsTable();
  }

  if (view === "homework") {
    renderHomeworkList();
  }

  if (view === "tests") {
    renderTestsList();
  }

  if (view === "results") {
    populateResultFormSelects();
    renderResultsTable();
  }

  if (view === "rollslips") {
    populateRollSlipStudentSelect();
  }

  if (view === "alldata") {
    renderAllDataTable("students");
  }
}

function switchStudentView(view) {
  document
    .querySelectorAll("#studentNav .nav-item")
    .forEach(b => {
      b.classList.toggle(
        "active",
        b.dataset.view === view
      );
    });

  document
    .querySelectorAll("#studentContent .view")
    .forEach(v => {
      v.classList.toggle(
        "hidden",
        v.dataset.view !== view
      );
    });

  const titles = {
    dashboard: "Dashboard",
    profile: "My Profile",
    homework: "My Homework",
    tests: "Available Tests",
    taketest: "Take Test",
    results: "My Results",
    rollslip: "Roll Number Slip"
  };

  document.getElementById("studentViewTitle").textContent =
    titles[view] || "Dashboard";

  closeMobileSidebar("student");

  if (view === "dashboard") {
    renderStudentDashboard();
  }

  if (view === "profile") {
    renderStudentProfile();
  }

  if (view === "homework") {
    renderStudentHomework();
  }

  if (view === "tests") {
    renderStudentTests();
  }

  if (view === "results") {
    renderStudentResults();
  }

  if (view === "rollslip") {
    renderStudentRollSlip();
  }
}

function closeMobileSidebar(who) {
  document
    .getElementById(
      who === "admin"
        ? "adminSidebar"
        : "studentSidebar"
    )
    .classList.remove("open");

  document
    .getElementById(
      who === "admin"
        ? "adminBackdrop"
        : "studentBackdrop"
    )
    .classList.remove("show");
}

/* ---------------------------------------------------------------------
   5. ADMIN — DASHBOARD
   --------------------------------------------------------------------- */

function renderAdminDashboard() {
  const counts = {
    3: 0,
    4: 0,
    5: 0,
    6: 0
  };

  students.forEach(s => {
    if (counts[s.className] !== undefined) {
      counts[s.className]++;
    }
  });

  const cards = [
    {
      label: "Total Students",
      value: students.length,
      tone: "navy"
    },
    {
      label: "Class 3 Students",
      value: counts[3],
      tone: "sky"
    },
    {
      label: "Class 4 Students",
      value: counts[4],
      tone: "sky"
    },
    {
      label: "Class 5 Students",
      value: counts[5],
      tone: "sky"
    },
    {
      label: "Class 6 Students",
      value: counts[6],
      tone: "sky"
    },
    {
      label: "Total Homework",
      value: homework.length,
      tone: "gold"
    },
    {
      label: "Total Tests",
      value: tests.length,
      tone: "gold"
    },
    {
      label: "Results Published",
      value: results.length,
      tone: "green"
    }
  ];

  document.getElementById("adminSummaryCards").innerHTML =
    cards.map(c => `
      <div class="summary-card tone-${c.tone}">
        <div class="sc-label">${c.label}</div>
        <div class="sc-value">${c.value}</div>
      </div>
    `).join("");

  const recent = [...students]
    .slice(-5)
    .reverse();

  const table = document.getElementById(
    "recentStudentsTable"
  );

  if (!recent.length) {
    table.innerHTML = `
      <tbody>
        <tr class="empty-row">
          <td>No students added yet.</td>
        </tr>
      </tbody>
    `;

    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Class</th>
        <th>Roll No</th>
        <th>Login ID</th>
        <th>Admission Date</th>
      </tr>
    </thead>

    <tbody>
      ${recent.map(s => `
        <tr>
          <td>${escapeHtml(s.name)}</td>
          <td>${CLASS_LABEL(s.className)}</td>
          <td class="mono">${escapeHtml(s.rollNo)}</td>
          <td class="mono">${escapeHtml(s.loginId)}</td>
          <td>${formatDate(s.admissionDate)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

/* ---------------------------------------------------------------------
   6. ADMIN — STUDENT MANAGEMENT
   --------------------------------------------------------------------- */

function renderStudentsTable() {
  const search = (
    document.getElementById("studentSearchInput").value || ""
  )
    .trim()
    .toLowerCase();

  const classFilter =
    document.getElementById("studentClassFilter").value;

  const list = students.filter(s => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search) ||
      s.rollNo.toLowerCase().includes(search) ||
      s.studentId.toLowerCase().includes(search) ||
      s.loginId.toLowerCase().includes(search);

    const matchesClass =
      classFilter === "all" ||
      s.className === classFilter;

    return matchesSearch && matchesClass;
  });

  const table = document.getElementById("studentsTable");

  if (!list.length) {
    table.innerHTML = `
      <tbody>
        <tr class="empty-row">
          <td>No students match your search.</td>
        </tr>
      </tbody>
    `;

    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Father Name</th>
        <th>Class</th>
        <th>Roll No</th>
        <th>Login ID</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      ${list.map(s => `
        <tr>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.fatherName)}</td>
          <td>${CLASS_LABEL(s.className)}</td>
          <td class="mono">${escapeHtml(s.rollNo)}</td>
          <td class="mono">${escapeHtml(s.loginId)}</td>

          <td class="row-actions">
            <button
              class="icon-btn"
              onclick="viewStudent(${s.id})">
              View
            </button>

            <button
              class="icon-btn"
              onclick="openEditStudentModal(${s.id})">
              Edit
            </button>

            <button
              class="icon-btn danger"
              onclick="deleteStudent(${s.id})">
              Delete
            </button>
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function studentFormFields(s = {}) {
  return `
    <label class="field">
      <span class="field-label">Student Name</span>
      <input
        type="text"
        id="f_name"
        value="${escapeHtml(s.name || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">Father Name</span>
      <input
        type="text"
        id="f_fatherName"
        value="${escapeHtml(s.fatherName || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">Class</span>
      <select id="f_className" required>
        <option value="">Select class</option>

        ${["3", "4", "5", "6"].map(c => `
          <option
            value="${c}"
            ${s.className === c ? "selected" : ""}>
            Class ${c}
          </option>
        `).join("")}
      </select>
    </label>

    <label class="field">
      <span class="field-label">Roll Number</span>
      <input
        type="text"
        id="f_rollNo"
        value="${escapeHtml(s.rollNo || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">Student ID</span>
      <input
        type="text"
        id="f_studentId"
        value="${escapeHtml(s.studentId || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">Login ID</span>
      <input
        type="text"
        id="f_loginId"
        value="${escapeHtml(s.loginId || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">Password</span>
      <input
        type="text"
        id="f_password"
        value="${escapeHtml(s.password || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">Date of Birth</span>
      <input
        type="date"
        id="f_dob"
        value="${escapeHtml(s.dob || "")}">
    </label>

    <label class="field">
      <span class="field-label">Gender</span>
      <select id="f_gender">
        <option value="">Select</option>
        <option value="Male" ${s.gender === "Male" ? "selected" : ""}>
          Male
        </option>
        <option value="Female" ${s.gender === "Female" ? "selected" : ""}>
          Female
        </option>
      </select>
    </label>

    <label class="field">
      <span class="field-label">Contact Number</span>
      <input
        type="text"
        id="f_contact"
        value="${escapeHtml(s.contact || "")}">
    </label>

    <label class="field field-wide">
      <span class="field-label">Address</span>
      <input
        type="text"
        id="f_address"
        value="${escapeHtml(s.address || "")}">
    </label>

    <label class="field">
      <span class="field-label">Admission Date</span>
      <input
        type="date"
        id="f_admissionDate"
        value="${escapeHtml(s.admissionDate || "")}">
    </label>

    <div
      class="field-wide field-error"
      id="studentFormError">
    </div>
  `;
}

function openAddStudentModal() {
  openModal(`
    <h3>Add Student</h3>

    <form
      id="studentForm"
      class="grid-form"
      onsubmit="return submitStudentForm(event)">

      ${studentFormFields()}

      <div class="field field-actions">
        <button
          type="submit"
          class="btn btn-primary btn-block">
          Add Student
        </button>
      </div>
    </form>
  `);
}

function openEditStudentModal(id) {
  const s = students.find(x => x.id === id);

  if (!s) return;

  openModal(`
    <h3>Edit Student</h3>

    <form
      id="studentForm"
      class="grid-form"
      onsubmit="return submitStudentForm(event, ${id})">

      ${studentFormFields(s)}

      <div class="field field-actions">
        <button
          type="submit"
          class="btn btn-primary btn-block">
          Save Changes
        </button>
      </div>
    </form>
  `);
}

function submitStudentForm(evt, editId) {
  evt.preventDefault();

  const data = {
    name: document.getElementById("f_name").value.trim(),
    fatherName: document
      .getElementById("f_fatherName")
      .value.trim(),

    className:
      document.getElementById("f_className").value,

    rollNo:
      document.getElementById("f_rollNo").value.trim(),

    studentId:
      document.getElementById("f_studentId").value.trim(),

    loginId:
      document.getElementById("f_loginId").value.trim(),

    password:
      document.getElementById("f_password").value.trim(),

    dob:
      document.getElementById("f_dob").value,

    gender:
      document.getElementById("f_gender").value,

    contact:
      document.getElementById("f_contact").value.trim(),

    address:
      document.getElementById("f_address").value.trim(),

    admissionDate:
      document.getElementById("f_admissionDate").value
  };

  const errorEl =
    document.getElementById("studentFormError");

  errorEl.textContent = "";

  if (
    !data.name ||
    !data.fatherName ||
    !data.className ||
    !data.rollNo ||
    !data.studentId ||
    !data.loginId ||
    !data.password
  ) {
    errorEl.textContent =
      "Please fill in all required fields.";

    return false;
  }

  const dupRoll = students.find(
    s =>
      s.rollNo === data.rollNo &&
      s.className === data.className &&
      s.id !== editId
  );

  const dupSid = students.find(
    s =>
      s.studentId === data.studentId &&
      s.id !== editId
  );

  const dupLogin = students.find(
    s =>
      s.loginId === data.loginId &&
      s.id !== editId
  );

  if (dupRoll) {
    errorEl.textContent =
      "This roll number is already used in this class.";

    return false;
  }

  if (dupSid) {
    errorEl.textContent =
      "This Student ID is already in use.";

    return false;
  }

  if (dupLogin) {
    errorEl.textContent =
      "This Login ID is already in use.";

    return false;
  }

  if (editId) {
    const idx = students.findIndex(
      s => s.id === editId
    );

    students[idx] = {
      ...students[idx],
      ...data
    };

    showToast(
      "Student updated successfully.",
      "success"
    );
  } else {
    data.id = nextId(students);
    students.push(data);

    showToast(
      "Student added successfully.",
      "success"
    );
  }

  saveData();
  closeModal();
  renderStudentsTable();
  renderAdminDashboard();

  return false;
}

function viewStudent(id) {
  const s = students.find(x => x.id === id);

  if (!s) return;

  const rows = [
    ["Student Name", s.name],
    ["Father Name", s.fatherName],
    ["Class", CLASS_LABEL(s.className)],
    ["Roll Number", s.rollNo],
    ["Student ID", s.studentId],
    ["Login ID", s.loginId],
    ["Date of Birth", formatDate(s.dob)],
    ["Gender", s.gender || "—"],
    ["Contact Number", s.contact || "—"],
    ["Address", s.address || "—"],
    ["Admission Date", formatDate(s.admissionDate)]
  ];

  openModal(`
    <h3>
      ${escapeHtml(s.name)} — Student Information
    </h3>

    <div class="profile-grid">
      ${rows.map(([label, val]) => `
        <div class="profile-item">
          <div class="pi-label">${label}</div>
          <div class="pi-value">
            ${escapeHtml(val)}
          </div>
        </div>
      `).join("")}
    </div>
  `);
}

async function deleteStudent(id) {
  const ok = await showConfirm(
    "Are you sure you want to delete this student?"
  );

  if (!ok) return;

  students = students.filter(
    s => s.id !== id
  );

  saveData();
  renderStudentsTable();
  renderAdminDashboard();

  showToast(
    "Student deleted successfully.",
    "success"
  );
}

/* ---------------------------------------------------------------------
   7. ADMIN — HOMEWORK MANAGEMENT
   --------------------------------------------------------------------- */

function renderHomeworkList() {
  const classFilter =
    document.getElementById("homeworkClassFilter").value;

  let list = homework.filter(
    h =>
      classFilter === "all" ||
      h.className === classFilter
  );

  list = [...list].sort(
    (a, b) =>
      (a.dueDate || "").localeCompare(
        b.dueDate || ""
      )
  );

  const wrap =
    document.getElementById("homeworkList");

  if (!list.length) {
    wrap.innerHTML = emptyState(
      "No homework yet",
      "Add a homework sheet to get students started."
    );

    return;
  }

  wrap.innerHTML = list.map(h => `
    <div class="item-card">

      <div class="item-card-main">

        <h4>
          ${escapeHtml(h.title)}
        </h4>

        <div class="item-meta">
          <span>
            📘 ${escapeHtml(h.subject)}
          </span>

          <span>
            🏫 ${CLASS_LABEL(h.className)}
          </span>

          <span>
            📅 Due ${formatDate(h.dueDate)}
          </span>
        </div>

        <div class="item-desc">
          ${escapeHtml(h.description)}
        </div>

      </div>

      <div class="item-card-actions">

        ${
          h.link
            ? `
              <a
                href="${escapeHtml(h.link)}"
                class="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer">
                Open Homework
              </a>
            `
            : `
              <span class="badge badge-red">
                No homework link
              </span>
            `
        }

        <button
          class="icon-btn"
          onclick="openEditHomeworkModal(${h.id})">
          Edit
        </button>

        <button
          class="icon-btn danger"
          onclick="deleteHomework(${h.id})">
          Delete
        </button>

      </div>

    </div>
  `).join("");
}

function emptyState(title, sub) {
  return `
    <div class="empty-state">
      <div class="es-title">
        ${title}
      </div>

      <div>
        ${sub}
      </div>
    </div>
  `;
}

/*
 * HOMEWORK FIX:
 * Added homework link field.
 * This was missing from the old homework form.
 */
function homeworkFormFields(h = {}) {
  return `
    <label class="field field-wide">
      <span class="field-label">
        Homework Title
      </span>

      <input
        type="text"
        id="hw_title"
        value="${escapeHtml(h.title || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">
        Subject
      </span>

      <input
        type="text"
        id="hw_subject"
        value="${escapeHtml(h.subject || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">
        Class
      </span>

      <select id="hw_className" required>
        <option value="">
          Select class
        </option>

        ${["3", "4", "5", "6"].map(c => `
          <option
            value="${c}"
            ${h.className === c ? "selected" : ""}>
            Class ${c}
          </option>
        `).join("")}
      </select>
    </label>

    <label class="field field-wide">
      <span class="field-label">
        Description
      </span>

      <textarea
        id="hw_description"
        required>${escapeHtml(h.description || "")}</textarea>
    </label>

    <label class="field">
      <span class="field-label">
        Due Date
      </span>

      <input
        type="date"
        id="hw_dueDate"
        value="${escapeHtml(h.dueDate || "")}"
        required>
    </label>

    <label class="field field-wide">
      <span class="field-label">
        Homework Link
      </span>

      <input
        type="url"
        id="hw_link"
        value="${escapeHtml(h.link || "")}"
        placeholder="https://drive.google.com/..."
        required>
    </label>

    <div
      class="field-wide field-error"
      id="hwFormError">
    </div>
  `;
}

function openAddHomeworkModal() {
  openModal(`
    <h3>
      Add Homework
    </h3>

    <form
      class="grid-form"
      onsubmit="return submitHomeworkForm(event)">

      ${homeworkFormFields()}

      <div class="field field-actions">
        <button
          type="submit"
          class="btn btn-primary btn-block">
          Add Homework
        </button>
      </div>

    </form>
  `);
}

function openEditHomeworkModal(id) {
  const h = homework.find(
    x => x.id === id
  );

  if (!h) return;

  openModal(`
    <h3>
      Edit Homework
    </h3>

    <form
      class="grid-form"
      onsubmit="return submitHomeworkForm(event, ${id})">

      ${homeworkFormFields(h)}

      <div class="field field-actions">
        <button
          type="submit"
          class="btn btn-primary btn-block">
          Save Changes
        </button>
      </div>

    </form>
  `);
}

function submitHomeworkForm(evt, editId) {
  evt.preventDefault();

  const data = {
    title:
      document.getElementById("hw_title")
        .value.trim(),

    subject:
      document.getElementById("hw_subject")
        .value.trim(),

    className:
      document.getElementById("hw_className")
        .value,

    description:
      document.getElementById("hw_description")
        .value.trim(),

    dueDate:
      document.getElementById("hw_dueDate")
        .value,

    link:
      document.getElementById("hw_link")
        .value.trim()
  };

  const errorEl =
    document.getElementById("hwFormError");

  errorEl.textContent = "";

  if (
    !data.title ||
    !data.subject ||
    !data.className ||
    !data.description ||
    !data.dueDate ||
    !data.link
  ) {
    errorEl.textContent =
      "Please fill in all fields.";

    return false;
  }

  try {
    new URL(data.link);
  } catch {
    errorEl.textContent =
      "Please enter a valid homework link.";

    return false;
  }

  if (editId) {
    const idx = homework.findIndex(
      h => h.id === editId
    );

    homework[idx] = {
      ...homework[idx],
      ...data
    };

    showToast(
      "Homework updated successfully.",
      "success"
    );
  } else {
    data.id = nextId(homework);

    homework.push(data);

    showToast(
      "Homework added successfully.",
      "success"
    );
  }

  saveData();
  closeModal();
  renderHomeworkList();
  renderAdminDashboard();

  return false;
}

async function deleteHomework(id) {
  const ok = await showConfirm(
    "Are you sure you want to delete this homework?"
  );

  if (!ok) return;

  homework = homework.filter(
    h => h.id !== id
  );

  saveData();
  renderHomeworkList();
  renderAdminDashboard();

  showToast(
    "Homework deleted successfully.",
    "success"
  );
}

/* ---------------------------------------------------------------------
   8. ADMIN — TEST MANAGEMENT
   --------------------------------------------------------------------- */

function renderTestsList() {
  const classFilter =
    document.getElementById("testClassFilter").value;

  const list = tests.filter(
    t =>
      classFilter === "all" ||
      t.className === classFilter
  );

  const wrap =
    document.getElementById("testsList");

  if (!list.length) {
    wrap.innerHTML = emptyState(
      "No tests yet",
      "Create a test and add questions for students to attempt."
    );

    return;
  }

  wrap.innerHTML = list.map(t => `
    <div class="item-card">

      <div class="item-card-main">

        <h4>
          ${escapeHtml(t.title)}
        </h4>

        <div class="item-meta">
          <span>
            📘 ${escapeHtml(t.subject)}
          </span>

          <span>
            🏫 ${CLASS_LABEL(t.className)}
          </span>

          <span>
            📝 ${t.questions.length}
            question${t.questions.length === 1 ? "" : "s"}
          </span>

          <span>
            💯 ${t.totalMarks} marks
          </span>

          <span>
            ⏱ ${t.duration} min
          </span>

          <span>
            📅 ${formatDate(t.testDate)}
          </span>
        </div>

      </div>

      <div class="item-card-actions">

        <button
          class="icon-btn"
          onclick="openManageQuestionsModal(${t.id})">
          Questions
        </button>

        <button
          class="icon-btn"
          onclick="openEditTestModal(${t.id})">
          Edit
        </button>

        <button
          class="icon-btn danger"
          onclick="deleteTest(${t.id})">
          Delete
        </button>

      </div>

    </div>
  `).join("");
}

function testFormFields(t = {}) {
  return `
    <label class="field field-wide">
      <span class="field-label">
        Test Title
      </span>

      <input
        type="text"
        id="t_title"
        value="${escapeHtml(t.title || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">
        Subject
      </span>

      <input
        type="text"
        id="t_subject"
        value="${escapeHtml(t.subject || "")}"
        required>
    </label>

    <label class="field">
      <span class="field-label">
        Class
      </span>

      <select id="t_className" required>
        <option value="">
          Select class
        </option>

        ${["3", "4", "5", "6"].map(c => `
          <option
            value="${c}"
            ${t.className === c ? "selected" : ""}>
            Class ${c}
          </option>
        `).join("")}
      </select>
    </label>

    <label class="field">
      <span class="field-label">
        Total Marks
      </span>

      <input
        type="number"
        id="t_totalMarks"
        min="1"
        value="${t.totalMarks || ""}"
        required>
    </label>

    <label class="field">
      <span class="field-label">
        Duration (minutes)
      </span>

      <input
        type="number"
        id="t_duration"
        min="1"
        value="${t.duration || ""}"
        required>
    </label>

    <label class="field field-wide">
      <span class="field-label">
        Test Date
      </span>

      <input
        type="date"
        id="t_testDate"
        value="${escapeHtml(t.testDate || "")}"
        required>
    </label>

    <div
      class="field-wide field-error"
      id="testFormError">
    </div>
  `;
}

function openAddTestModal() {
  openModal(`
    <h3>
      Create Test
    </h3>

    <form
      class="grid-form"
      onsubmit="return submitTestForm(event)">

      ${testFormFields()}

      <div class="field field-actions">
        <button
          type="submit"
          class="btn btn-primary btn-block">
          Create Test
        </button>
      </div>

    </form>
  `);
}

function openEditTestModal(id) {
  const t = tests.find(
    x => x.id === id
  );

  if (!t) return;

  openModal(`
    <h3>
      Edit Test
    </h3>

    <form
      class="grid-form"
      onsubmit="return submitTestForm(event, ${id})">

      ${testFormFields(t)}

      <div class="field field-actions">
        <button
          type="submit"
          class="btn btn-primary btn-block">
          Save Changes
        </button>
      </div>

    </form>
  `);
}

function submitTestForm(evt, editId) {
  evt.preventDefault();

  const data = {
    title:
      document.getElementById("t_title")
        .value.trim(),

    subject:
      document.getElementById("t_subject")
        .value.trim(),

    className:
      document.getElementById("t_className")
        .value,

    totalMarks:
      parseInt(
        document.getElementById("t_totalMarks").value,
        10
      ),

    duration:
      parseInt(
        document.getElementById("t_duration").value,
        10
      ),

    testDate:
      document.getElementById("t_testDate").value
  };

  const errorEl =
    document.getElementById("testFormError");

  if (
    !data.title ||
    !data.subject ||
    !data.className ||
    !data.totalMarks ||
    !data.duration ||
    !data.testDate
  ) {
    errorEl.textContent =
      "Please fill in all fields with valid values.";

    return false;
  }

  if (editId) {
    const idx = tests.findIndex(
      t => t.id === editId
    );

    tests[idx] = {
      ...tests[idx],
      ...data
    };

    showToast(
      "Test updated successfully.",
      "success"
    );
  } else {
    data.id = nextId(tests);
    data.questions = [];

    tests.push(data);

    showToast(
      "Test created successfully.",
      "success"
    );
  }

  saveData();
  closeModal();
  renderTestsList();
  renderAdminDashboard();

  return false;
}

async function deleteTest(id) {
  const ok = await showConfirm(
    "Are you sure you want to delete this test?"
  );

  if (!ok) return;

  tests = tests.filter(
    t => t.id !== id
  );

  saveData();
  renderTestsList();
  renderAdminDashboard();

  showToast(
    "Test deleted successfully.",
    "success"
  );
}

function openManageQuestionsModal(testId) {
  const t = tests.find(
    x => x.id === testId
  );

  if (!t) return;

  openModal(`
    <h3>
      Questions — ${escapeHtml(t.title)}
    </h3>

    <div
      class="question-list"
      id="questionList">
    </div>

    <hr
      style="
        border:none;
        border-top:1px solid var(--line);
        margin:20px 0;
      ">

    <form
      id="questionForm"
      class="grid-form"
      onsubmit="return submitQuestionForm(event, ${testId})">

      <fieldset class="qn-block">

        <legend>
          New Question
        </legend>

        <label class="field">
          <span class="field-label">
            Question
          </span>

          <input
            type="text"
            id="q_text"
            placeholder="e.g. What is 5 + 5?"
            required>
        </label>

        <div class="qn-options-grid">

          <label class="field">
            <span class="field-label">
              Option A
            </span>

            <input
              type="text"
              id="q_opt0"
              required>
          </label>

          <label class="field">
            <span class="field-label">
              Option B
            </span>

            <input
              type="text"
              id="q_opt1"
              required>
          </label>

          <label class="field">
            <span class="field-label">
              Option C
            </span>

            <input
              type="text"
              id="q_opt2"
              required>
          </label>

          <label class="field">
            <span class="field-label">
              Option D
            </span>

            <input
              type="text"
              id="q_opt3"
              required>
          </label>

        </div>

        <label
          class="field"
          style="margin-top:10px;">

          <span class="field-label">
            Correct Answer
          </span>

          <select id="q_correct" required>
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
            <option value="3">D</option>
          </select>

        </label>

      </fieldset>

      <div
        class="field-wide field-error"
        id="qFormError">
      </div>

      <div class="field field-actions">
        <button
          type="submit"
          class="btn btn-primary btn-block">
          + Add Question
        </button>
      </div>

    </form>
  `);

  renderQuestionList(testId);
}

function renderQuestionList(testId) {
  const t = tests.find(
    x => x.id === testId
  );

  const wrap =
    document.getElementById("questionList");

  if (!t.questions.length) {
    wrap.innerHTML = `
      <div
        class="empty-state"
        style="padding:20px;">
        No questions added yet.
      </div>
    `;

    return;
  }

  const letters = [
    "A",
    "B",
    "C",
    "D"
  ];

  wrap.innerHTML = t.questions.map(
    (q, i) => `
      <div class="question-row">

        <div>

          <div class="q-text">
            ${i + 1}. ${escapeHtml(q.text)}
          </div>

          <div class="q-opts">
            ${q.options.map(
              (o, oi) =>
                `${letters[oi]}. ${escapeHtml(o)}
                ${
                  oi === q.correct
                    ? '<span class="q-correct">✓ correct</span>'
                    : ""
                }`
            ).join(" &nbsp;·&nbsp; ")}
          </div>

        </div>

        <button
          class="icon-btn danger"
          onclick="deleteQuestion(${testId}, ${q.id})">
          Delete
        </button>

      </div>
    `
  ).join("");
}

function submitQuestionForm(evt, testId) {
  evt.preventDefault();

  const text =
    document.getElementById("q_text")
      .value.trim();

  const opts = [0, 1, 2, 3].map(
    i =>
      document
        .getElementById(`q_opt${i}`)
        .value.trim()
  );

  const correct =
    parseInt(
      document.getElementById("q_correct").value,
      10
    );

  const errorEl =
    document.getElementById("qFormError");

  if (!text || opts.some(o => !o)) {
    errorEl.textContent =
      "Please fill in the question and all four options.";

    return false;
  }

  const t = tests.find(
    x => x.id === testId
  );

  t.questions.push({
    id: nextId(t.questions),
    text,
    options: opts,
    correct
  });

  saveData();

  showToast(
    "Question added successfully.",
    "success"
  );

  document
    .getElementById("questionForm")
    .reset();

  renderQuestionList(testId);
  renderTestsList();

  return false;
}

async function deleteQuestion(testId, qId) {
  const ok = await showConfirm(
    "Are you sure you want to delete this question?"
  );

  if (!ok) return;

  const t = tests.find(
    x => x.id === testId
  );

  t.questions = t.questions.filter(
    q => q.id !== qId
  );

  saveData();

  renderQuestionList(testId);
  renderTestsList();

  showToast(
    "Question deleted successfully.",
    "success"
  );
}

/* ---------------------------------------------------------------------
   9. ADMIN — RESULT MANAGEMENT
   --------------------------------------------------------------------- */

function populateResultFormSelects() {
  const classSel =
    document.getElementById("resultClassSelect");

  classSel.onchange = () => {
    const cls = classSel.value;

    const studentSel =
      document.getElementById("resultStudentSelect");

    const testSel =
      document.getElementById("resultTestSelect");

    const classStudents =
      students.filter(
        s => s.className === cls
      );

    const classTests =
      tests.filter(
        t => t.className === cls
      );

    studentSel.innerHTML =
      classStudents.length
        ? `
          <option value="">
            Select student
          </option>

          ${classStudents.map(s => `
            <option value="${s.id}">
              ${escapeHtml(s.name)}
              (Roll ${escapeHtml(s.rollNo)})
            </option>
          `).join("")}
        `
        : `
          <option value="">
            No students in this class
          </option>
        `;

    testSel.innerHTML =
      classTests.length
        ? `
          <option value="">
            Select test
          </option>

          ${classTests.map(t => `
            <option value="${t.id}">
              ${escapeHtml(t.title)}
              — ${escapeHtml(t.subject)}
            </option>
          `).join("")}
        `
        : `
          <option value="">
            No tests in this class
          </option>
        `;
  };

  testSelectAutoFillMarks();

  const subjectSel =
    document.getElementById(
      "resultFilterSubject"
    );

  const subjects = [
    ...new Set(
      results.map(r => r.subject)
    )
  ];

  subjectSel.innerHTML =
    `
      <option value="all">
        All Subjects
      </option>
    ` +
    subjects.map(
      s =>
        `<option value="${escapeHtml(s)}">
          ${escapeHtml(s)}
        </option>`
    ).join("");
}

function testSelectAutoFillMarks() {
  document
    .getElementById("resultTestSelect")
    .addEventListener(
      "change",
      e => {
        const test = tests.find(
          t =>
            t.id ===
            parseInt(e.target.value, 10)
        );

        if (test) {
          document
            .getElementById("resultTotalMarks")
            .value = test.totalMarks;
        }
      }
    );
}

function submitPublishResultForm(evt) {
  evt.preventDefault();

  const className =
    document.getElementById(
      "resultClassSelect"
    ).value;

  const studentId =
    parseInt(
      document.getElementById(
        "resultStudentSelect"
      ).value,
      10
    );

  const testId =
    parseInt(
      document.getElementById(
        "resultTestSelect"
      ).value,
      10
    );

  const totalMarks =
    parseFloat(
      document.getElementById(
        "resultTotalMarks"
      ).value
    );

  const obtainedMarks =
    parseFloat(
      document.getElementById(
        "resultObtainedMarks"
      ).value
    );

  if (
    !className ||
    !studentId ||
    !testId ||
    !totalMarks ||
    isNaN(obtainedMarks)
  ) {
    showToast(
      "Please complete all fields to publish a result.",
      "error"
    );

    return false;
  }

  if (obtainedMarks > totalMarks) {
    showToast(
      "Obtained marks cannot exceed total marks.",
      "error"
    );

    return false;
  }

  const student =
    students.find(
      s => s.id === studentId
    );

  const test =
    tests.find(
      t => t.id === testId
    );

  const percentage =
    Math.round(
      (obtainedMarks / totalMarks) * 1000
    ) / 10;

  results.push({
    id: nextId(results),
    studentDbId: student.id,
    studentName: student.name,
    rollNo: student.rollNo,
    className,
    subject: test.subject,
    testId,
    testName: test.title,
    totalMarks,
    obtainedMarks,
    percentage,
    grade: calculateGrade(percentage),
    status: calculateStatus(percentage),
    date: new Date()
      .toISOString()
      .slice(0, 10),
    source: "Admin"
  });

  saveData();

  showToast(
    "Result published successfully.",
    "success"
  );

  document
    .getElementById("publishResultForm")
    .reset();

  populateResultFormSelects();
  renderResultsTable();
  renderAdminDashboard();

  return false;
}

function renderResultsTable() {
  const classFilter =
    document.getElementById(
      "resultFilterClass"
    ).value;

  const subjectFilter =
    document.getElementById(
      "resultFilterSubject"
    ).value;

  let list = results.filter(
    r =>
      (
        classFilter === "all" ||
        r.className === classFilter
      ) &&
      (
        subjectFilter === "all" ||
        r.subject === subjectFilter
      )
  );

  list = [...list].reverse();

  const table =
    document.getElementById(
      "resultsTable"
    );

  if (!list.length) {
    table.innerHTML = `
      <tbody>
        <tr class="empty-row">
          <td>
            No results published yet.
          </td>
        </tr>
      </tbody>
    `;

    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Student</th>
        <th>Class</th>
        <th>Test</th>
        <th>Subject</th>
        <th>Marks</th>
        <th>%</th>
        <th>Grade</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      ${list.map(r => `
        <tr>

          <td>
            ${escapeHtml(r.studentName)}
            <span
              class="mono"
              style="color:var(--ink-400);">
              (${escapeHtml(r.rollNo)})
            </span>
          </td>

          <td>
            ${CLASS_LABEL(r.className)}
          </td>

          <td>
            ${escapeHtml(r.testName)}
          </td>

          <td>
            ${escapeHtml(r.subject)}
          </td>

          <td class="mono">
            ${r.obtainedMarks}/${r.totalMarks}
          </td>

          <td class="mono">
            ${r.percentage}%
          </td>

          <td>
            <span class="badge badge-gold">
              ${r.grade}
            </span>
          </td>

          <td>
            <span
              class="badge ${
                r.status === "Pass"
                  ? "badge-green"
                  : "badge-red"
              }">
              ${r.status}
            </span>
          </td>

          <td>
            <button
              class="icon-btn danger"
              onclick="deleteResult(${r.id})">
              Delete
            </button>
          </td>

        </tr>
      `).join("")}
    </tbody>
  `;
}

async function deleteResult(id) {
  const ok = await showConfirm(
    "Are you sure you want to delete this result?"
  );

  if (!ok) return;

  results = results.filter(
    r => r.id !== id
  );

  saveData();
  renderResultsTable();
  renderAdminDashboard();

  showToast(
    "Result deleted successfully.",
    "success"
  );
}

/* ---------------------------------------------------------------------
   10. ADMIN — ROLL NUMBER SLIPS
   --------------------------------------------------------------------- */

function populateRollSlipStudentSelect() {
  const sel =
    document.getElementById(
      "rollSlipStudentSelect"
    );

  sel.innerHTML =
    `
      <option value="">
        Select a student
      </option>
    ` +
    students.map(s => `
      <option value="${s.id}">
        ${escapeHtml(s.name)}
        — ${CLASS_LABEL(s.className)}
        (Roll ${escapeHtml(s.rollNo)})
      </option>
    `).join("");

  document
    .getElementById(
      "rollSlipPreviewPanel"
    )
    .style.display = "none";
}

function buildRollSlipHtml(
  student,
  examName,
  examDate,
  subjects
) {
  return `
    <div id="printableSlipArea">

      <div class="roll-slip">

        <div class="roll-slip-band">

          <div class="rs-crest">
            <svg
              viewBox="0 0 100 100"
              width="40"
              height="40">

              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                stroke-width="3"/>

              <path
                d="
                  M50 22
                  L60 44
                  L84 44
                  L64 58
                  L72 82
                  L50 68
                  L28 82
                  L36 58
                  L16 44
                  L40 44
                  Z"
                fill="currentColor"/>
            </svg>
          </div>

          <div>
            <h4>
              Willow Creek Academy
            </h4>

            <div class="rs-sub">
              Roll Number Slip
            </div>
          </div>

        </div>

        <div class="roll-slip-body">

          <div class="roll-slip-photo">
            Student<br>
            Photo
          </div>

          <div class="roll-slip-fields">

            <div class="rs-field">
              <div class="rs-label">
                Student Name
              </div>

              <div class="rs-value">
                ${escapeHtml(student.name)}
              </div>
            </div>

            <div class="rs-field">
              <div class="rs-label">
                Father Name
              </div>

              <div class="rs-value">
                ${escapeHtml(student.fatherName)}
              </div>
            </div>

            <div class="rs-field">
              <div class="rs-label">
                Class
              </div>

              <div class="rs-value">
                ${CLASS_LABEL(student.className)}
              </div>
            </div>

            <div class="rs-field">
              <div class="rs-label">
                Roll Number
              </div>

              <div class="rs-value">
                ${escapeHtml(student.rollNo)}
              </div>
            </div>

            <div class="rs-field">
              <div class="rs-label">
                Student ID
              </div>

              <div class="rs-value">
                ${escapeHtml(student.studentId)}
              </div>
            </div>

            <div class="rs-field">
              <div class="rs-label">
                Exam Date
              </div>

              <div class="rs-value">
                ${formatDate(examDate)}
              </div>
            </div>

          </div>
        </div>

        <div class="roll-slip-divider"></div>

        <div class="roll-slip-subjects">

          <div class="rs-label">
            ${escapeHtml(examName)} — Subjects
          </div>

          <div class="subject-chips">
            ${subjects.map(s => `
              <span class="subject-chip">
                ${escapeHtml(s)}
              </span>
            `).join("")}
          </div>

        </div>

        <div class="roll-slip-instructions">

          <strong>
            Important Instructions:
          </strong>

          Bring this slip to every paper.
          Arrive at least 15 minutes before
          the exam time.

          No electronic devices are allowed
          in the examination hall.

          Loss of this slip must be reported
          to the office immediately.

        </div>

        <div class="roll-slip-footer">

          <div class="rs-seal">
            OFFICIAL<br>
            SEAL
          </div>

          <div class="rs-signature">

            <div class="sig-line"></div>

            <div class="sig-label">
              Principal's Signature
            </div>

          </div>

        </div>

      </div>

    </div>
  `;
}

function submitRollSlipForm(evt) {
  evt.preventDefault();

  const studentId =
    parseInt(
      document.getElementById(
        "rollSlipStudentSelect"
      ).value,
      10
    );

  const examName =
    document.getElementById(
      "rollSlipExamName"
    ).value.trim();

  const examDate =
    document.getElementById(
      "rollSlipExamDate"
    ).value;

  const subjectsRaw =
    document.getElementById(
      "rollSlipSubjects"
    ).value.trim();

  if (
    !studentId ||
    !examName ||
    !examDate ||
    !subjectsRaw
  ) {
    showToast(
      "Please complete all fields to generate a slip.",
      "error"
    );

    return false;
  }

  const subjects =
    subjectsRaw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

  const student =
    students.find(
      s => s.id === studentId
    );

  rollSlips.push({
    id: nextId(rollSlips),
    studentId,
    examName,
    examDate,
    subjects,
    generatedDate: new Date()
      .toISOString()
      .slice(0, 10)
  });

  saveData();

  document
    .getElementById(
      "rollSlipPreviewPanel"
    )
    .style.display = "block";

  document
    .getElementById(
      "rollSlipPreviewMount"
    )
    .innerHTML = buildRollSlipHtml(
      student,
      examName,
      examDate,
      subjects
    );

  showToast(
    "Roll number slip generated.",
    "success"
  );

  return false;
}

/* ---------------------------------------------------------------------
   11. ADMIN — VIEW ALL DATA
   --------------------------------------------------------------------- */

function renderAllDataTable(set) {
  document
    .querySelectorAll("#allDataTabs .chip")
    .forEach(c => {
      c.classList.toggle(
        "active",
        c.dataset.set === set
      );
    });

  const table =
    document.getElementById(
      "allDataTable"
    );

  const data = {
    students,
    homework,
    tests,
    results,
    rollSlips
  }[set];

  if (!data || !data.length) {
    table.innerHTML = `
      <tbody>
        <tr class="empty-row">
          <td>
            No data in this set.
          </td>
        </tr>
      </tbody>
    `;

    return;
  }

  let rows;

  if (set === "students") {
    rows = {
      head: [
        "ID",
        "Name",
        "Class",
        "Roll No",
        "Student ID",
        "Login ID"
      ],

      body: data.map(s => [
        s.id,
        s.name,
        CLASS_LABEL(s.className),
        s.rollNo,
        s.studentId,
        s.loginId
      ])
    };
  } else if (set === "homework") {
    rows = {
      head: [
        "ID",
        "Title",
        "Subject",
        "Class",
        "Due Date"
      ],

      body: data.map(h => [
        h.id,
        h.title,
        h.subject,
        CLASS_LABEL(h.className),
        formatDate(h.dueDate)
      ])
    };
  } else if (set === "tests") {
    rows = {
      head: [
        "ID",
        "Title",
        "Subject",
        "Class",
        "Questions",
        "Total Marks"
      ],

      body: data.map(t => [
        t.id,
        t.title,
        t.subject,
        CLASS_LABEL(t.className),
        t.questions.length,
        t.totalMarks
      ])
    };
  } else if (set === "results") {
    rows = {
      head: [
        "ID",
        "Student",
        "Class",
        "Test",
        "Marks",
        "Grade",
        "Status"
      ],

      body: data.map(r => [
        r.id,
        r.studentName,
        CLASS_LABEL(r.className),
        r.testName,
        `${r.obtainedMarks}/${r.totalMarks}`,
        r.grade,
        r.status
      ])
    };
  } else {
    rows = {
      head: [
        "ID",
        "Student",
        "Exam",
        "Exam Date"
      ],

      body: data.map(rs => {
        const st =
          students.find(
            s => s.id === rs.studentId
          );

        return [
          rs.id,
          st ? st.name : "—",
          rs.examName,
          formatDate(rs.examDate)
        ];
      })
    };
  }

  table.innerHTML = `
    <thead>
      <tr>
        ${rows.head
          .map(h => `<th>${h}</th>`)
          .join("")}
      </tr>
    </thead>

    <tbody>
      ${rows.body.map(r => `
        <tr>
          ${r.map(c =>
            `<td>${escapeHtml(c)}</td>`
          ).join("")}
        </tr>
      `).join("")}
    </tbody>
  `;
}

/* ---------------------------------------------------------------------
   12. STUDENT — DASHBOARD / PROFILE
   --------------------------------------------------------------------- */

function renderStudentDashboard() {
  const s = currentStudent();

  if (!s) return;

  document.getElementById(
    "studentWelcomeName"
  ).textContent = s.name;

  document.getElementById(
    "studentTopbarName"
  ).textContent = s.name;

  const myHomework =
    homework.filter(
      h => h.className === s.className
    );

  const myTests =
    tests.filter(
      t => t.className === s.className
    );

  const myResults =
    results.filter(
      r => r.studentDbId === s.id
    );

  const cards = [
    {
      label: "My Class",
      value: CLASS_LABEL(s.className),
      tone: "navy"
    },
    {
      label: "Roll Number",
      value: s.rollNo,
      tone: "sky"
    },
    {
      label: "Pending Homework",
      value: myHomework.length,
      tone: "gold"
    },
    {
      label: "Available Tests",
      value: myTests.length,
      tone: "sky"
    },
    {
      label: "Published Results",
      value: myResults.length,
      tone: "green"
    }
  ];

  document.getElementById(
    "studentSummaryCards"
  ).innerHTML =
    cards.map(c => `
      <div class="summary-card tone-${c.tone}">
        <div class="sc-label">
          ${c.label}
        </div>

        <div class="sc-value">
          ${c.value}
        </div>
      </div>
    `).join("");
}

function renderStudentProfile() {
  const s = currentStudent();

  if (!s) return;

  const rows = [
    ["Name", s.name],
    ["Father Name", s.fatherName],
    ["Class", CLASS_LABEL(s.className)],
    ["Roll Number", s.rollNo],
    ["Student ID", s.studentId],
    ["Date of Birth", formatDate(s.dob)],
    ["Contact", s.contact || "—"],
    ["Address", s.address || "—"]
  ];

  document.getElementById(
    "studentProfileGrid"
  ).innerHTML =
    rows.map(([label, val]) => `
      <div class="profile-item">

        <div class="pi-label">
          ${label}
        </div>

        <div class="pi-value">
          ${escapeHtml(val)}
        </div>

      </div>
    `).join("");
}

/* ---------------------------------------------------------------------
   13. STUDENT — HOMEWORK / TESTS LIST
   --------------------------------------------------------------------- */

function renderStudentHomework() {
  const s = currentStudent();

  if (!s) return;

  const list = homework
    .filter(
      h => h.className === s.className
    )
    .sort(
      (a, b) =>
        (a.dueDate || "").localeCompare(
          b.dueDate || ""
        )
    );

  const wrap =
    document.getElementById(
      "studentHomeworkList"
    );

  if (!list.length) {
    wrap.innerHTML = emptyState(
      "No homework assigned",
      "Your teacher hasn't posted any homework for your class yet."
    );

    return;
  }

  wrap.innerHTML = list.map(h => `
    <div class="item-card">

      <div class="item-card-main">

        <h4>
          ${escapeHtml(h.title)}
        </h4>

        <div class="item-meta">

          <span>
            📘 ${escapeHtml(h.subject)}
          </span>

          <span>
            📅 Due ${formatDate(h.dueDate)}
          </span>

        </div>

        <div class="item-desc">
          ${escapeHtml(h.description)}
        </div>

      </div>

      <div class="item-card-actions">

        ${
          h.link
            ? `
              <a
                href="${escapeHtml(h.link)}"
                class="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer">
                Open Homework
              </a>
            `
            : `
              <span class="badge badge-red">
                No homework link
              </span>
            `
        }

      </div>

    </div>
  `).join("");
}

function renderStudentTests() {
  const s = currentStudent();

  if (!s) return;

  const myResults =
    results.filter(
      r => r.studentDbId === s.id
    );

  const list =
    tests.filter(
      t => t.className === s.className
    );

  const wrap =
    document.getElementById(
      "studentTestsList"
    );

  if (!list.length) {
    wrap.innerHTML = emptyState(
      "No tests available",
      "Check back later — your teacher hasn't scheduled a test yet."
    );

    return;
  }

  wrap.innerHTML = list.map(t => {
    const taken =
      myResults.find(
        r => r.testId === t.id
      );

    return `
      <div class="item-card">

        <div class="item-card-main">

          <h4>
            ${escapeHtml(t.title)}
          </h4>

          <div class="item-meta">

            <span>
              📘 ${escapeHtml(t.subject)}
            </span>

            <span>
              📝 ${t.questions.length}
              question${t.questions.length === 1 ? "" : "s"}
            </span>

            <span>
              💯 ${t.totalMarks} marks
            </span>

            <span>
              ⏱ ${t.duration} min
            </span>

            <span>
              📅 ${formatDate(t.testDate)}
            </span>

          </div>

        </div>

        <div class="item-card-actions">

          ${
            taken
              ? `
                <span class="badge badge-green">
                  Completed · ${taken.percentage}%
                </span>
              `
              : t.questions.length
                ? `
                  <button
                    class="btn btn-primary btn-sm"
                    onclick="startTest(${t.id})">
                    Take Test
                  </button>
                `
                : `
                  <span class="badge badge-red">
                    No questions yet
                  </span>
                `
          }

        </div>

      </div>
    `;
  }).join("");
}

/* ---------------------------------------------------------------------
   14. STUDENT — TAKE TEST
   --------------------------------------------------------------------- */

let activeTestRun = null;

function startTest(testId) {
  const t = tests.find(
    x => x.id === testId
  );

  if (!t || !t.questions.length) return;

  activeTestRun = {
    test: t,
    answers: {},
    index: 0,
    secondsLeft: t.duration * 60
  };

  switchStudentView("taketest");

  renderTestRunner();

  activeTestRun.timerHandle =
    setInterval(
      tickTimer,
      1000
    );
}

function tickTimer() {
  if (!activeTestRun) return;

  activeTestRun.secondsLeft--;

  updateTimerDisplay();

  if (
    activeTestRun.secondsLeft <= 0
  ) {
    clearInterval(
      activeTestRun.timerHandle
    );

    submitActiveTest();
  }
}

function updateTimerDisplay() {
  const el =
    document.getElementById(
      "runnerTimer"
    );

  if (!el || !activeTestRun) return;

  const m =
    Math.floor(
      activeTestRun.secondsLeft / 60
    );

  const sVal =
    activeTestRun.secondsLeft % 60;

  el.textContent =
    `${String(m).padStart(2, "0")}:${String(sVal).padStart(2, "0")}`;

  el.classList.toggle(
    "low",
    activeTestRun.secondsLeft <= 30
  );
}

function renderTestRunner() {
  const panel =
    document.getElementById(
      "takeTestPanel"
    );

  if (!activeTestRun) {
    panel.innerHTML = "";
    return;
  }

  const {
    test,
    index,
    answers
  } = activeTestRun;

  const q =
    test.questions[index];

  const letters = [
    "A",
    "B",
    "C",
    "D"
  ];

  panel.innerHTML = `
    <div class="test-runner-head">

      <div>

        <h3>
          ${escapeHtml(test.title)}
        </h3>

        <div class="item-meta">
          <span>
            ${escapeHtml(test.subject)}
          </span>

          <span>
            ${CLASS_LABEL(test.className)}
          </span>
        </div>

      </div>

      <div
        class="timer-pill"
        id="runnerTimer">
        --:--
      </div>

    </div>

    <div class="qn-progress">
      Question ${index + 1}
      of ${test.questions.length}
    </div>

    <div class="qn-runner-text">
      ${escapeHtml(q.text)}
    </div>

    <div class="qn-runner-options">

      ${q.options.map((opt, oi) => `
        <div
          class="option-row ${
            answers[q.id] === oi
              ? "selected"
              : ""
          }"
          onclick="selectAnswer(${q.id}, ${oi})">

          <span class="option-letter">
            ${letters[oi]}
          </span>

          <span>
            ${escapeHtml(opt)}
          </span>

        </div>
      `).join("")}

    </div>

    <div class="runner-nav">

      <button
        class="btn btn-ghost"
        ${index === 0 ? "disabled" : ""}
        onclick="runnerPrev()">
        ← Previous
      </button>

      ${
        index === test.questions.length - 1
          ? `
            <button
              class="btn btn-primary"
              onclick="submitActiveTest()">
              Submit Test
            </button>
          `
          : `
            <button
              class="btn btn-primary"
              onclick="runnerNext()">
              Next →
            </button>
          `
      }

    </div>
  `;

  updateTimerDisplay();
}

function selectAnswer(qId, optionIndex) {
  if (!activeTestRun) return;

  activeTestRun.answers[qId] =
    optionIndex;

  renderTestRunner();
}

function runnerNext() {
  if (
    activeTestRun.index <
    activeTestRun.test.questions.length - 1
  ) {
    activeTestRun.index++;
  }

  renderTestRunner();
}

function runnerPrev() {
  if (
    activeTestRun.index > 0
  ) {
    activeTestRun.index--;
  }

  renderTestRunner();
}

function submitActiveTest() {
  if (!activeTestRun) return;

  clearInterval(
    activeTestRun.timerHandle
  );

  const {
    test,
    answers
  } = activeTestRun;

  const s = currentStudent();

  let correctCount = 0;

  test.questions.forEach(q => {
    if (
      answers[q.id] === q.correct
    ) {
      correctCount++;
    }
  });

  const obtainedMarks =
    Math.round(
      (
        correctCount /
        test.questions.length
      ) *
      test.totalMarks *
      100
    ) / 100;

  const percentage =
    Math.round(
      (
        obtainedMarks /
        test.totalMarks
      ) *
      1000
    ) / 10;

  const grade =
    calculateGrade(percentage);

  const status =
    calculateStatus(percentage);

  results.push({
    id: nextId(results),
    studentDbId: s.id,
    studentName: s.name,
    rollNo: s.rollNo,
    className: s.className,
    subject: test.subject,
    testId: test.id,
    testName: test.title,
    totalMarks: test.totalMarks,
    obtainedMarks,
    percentage,
    grade,
    status,
    date: new Date()
      .toISOString()
      .slice(0, 10),
    source: "Student Submission"
  });

  saveData();

  const panel =
    document.getElementById(
      "takeTestPanel"
    );

  panel.innerHTML = `
    <div class="result-summary-banner">

      <div class="rs-grade">
        ${grade}
      </div>

      <h3>
        ${
          status === "Pass"
            ? "Well done!"
            : "Test submitted"
        }
      </h3>

      <p class="rs-line">
        ${escapeHtml(test.title)}
        — you scored
        ${obtainedMarks}
        out of
        ${test.totalMarks}
        (${percentage}%)
      </p>

      <p class="rs-line">

        <span
          class="badge ${
            status === "Pass"
              ? "badge-green"
              : "badge-red"
          }">
          ${status}
        </span>

      </p>

      <br>

      <button
        class="btn btn-primary"
        onclick="switchStudentView('results')">
        View My Results
      </button>

    </div>
  `;

  activeTestRun = null;

  showToast(
    "Test submitted successfully.",
    "success"
  );
}

/* ---------------------------------------------------------------------
   15. STUDENT — RESULTS / ROLL SLIP
   --------------------------------------------------------------------- */

function renderStudentResults() {
  const s = currentStudent();

  if (!s) return;

  const list =
    [
      ...results.filter(
        r => r.studentDbId === s.id
      )
    ].reverse();

  const table =
    document.getElementById(
      "studentResultsTable"
    );

  if (!list.length) {
    table.innerHTML = `
      <tbody>
        <tr class="empty-row">
          <td>
            No results published yet.
          </td>
        </tr>
      </tbody>
    `;

    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Test</th>
        <th>Subject</th>
        <th>Marks</th>
        <th>Percentage</th>
        <th>Grade</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>

    <tbody>
      ${list.map(r => `
        <tr>

          <td>
            ${escapeHtml(r.testName)}
          </td>

          <td>
            ${escapeHtml(r.subject)}
          </td>

          <td class="mono">
            ${r.obtainedMarks}/${r.totalMarks}
          </td>

          <td class="mono">
            ${r.percentage}%
          </td>

          <td>
            <span class="badge badge-gold">
              ${r.grade}
            </span>
          </td>

          <td>
            <span
              class="badge ${
                r.status === "Pass"
                  ? "badge-green"
                  : "badge-red"
              }">
              ${r.status}
            </span>
          </td>

          <td>
            ${formatDate(r.date)}
          </td>

        </tr>
      `).join("")}
    </tbody>
  `;
}

function renderStudentRollSlip() {
  const s = currentStudent();

  if (!s) return;

  const mySlips =
    rollSlips.filter(
      rs => rs.studentId === s.id
    );

  const mount =
    document.getElementById(
      "studentRollSlipMount"
    );

  const printBtn =
    document.getElementById(
      "studentPrintSlipBtn"
    );

  if (!mySlips.length) {
    mount.innerHTML = emptyState(
      "No roll number slip yet",
      "Ask your Admin to generate a roll number slip for your upcoming exam."
    );

    printBtn.classList.add("hidden");

    return;
  }

  const slip =
    mySlips[mySlips.length - 1];

  mount.innerHTML =
    buildRollSlipHtml(
      s,
      slip.examName,
      slip.examDate,
      slip.subjects
    );

  printBtn.classList.remove(
    "hidden"
  );
}

/* ---------------------------------------------------------------------
   16. EVENT WIRING / INIT
   --------------------------------------------------------------------- */

function wireLoginScreen() {
  document
    .querySelectorAll(".role-tab")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".role-tab")
            .forEach(t => {
              t.classList.remove(
                "active"
              );

              t.setAttribute(
                "aria-selected",
                "false"
              );
            });

          tab.classList.add("active");

          tab.setAttribute(
            "aria-selected",
            "true"
          );

          const role =
            tab.dataset.role;

          document
            .getElementById(
              "adminLoginForm"
            )
            .classList.toggle(
              "hidden",
              role !== "admin"
            );

          document
            .getElementById(
              "studentLoginForm"
            )
            .classList.toggle(
              "hidden",
              role !== "student"
            );

          hideLoginError();
        }
      );
    });

  document
    .getElementById("adminLoginForm")
    .addEventListener(
      "submit",
      e => {
        e.preventDefault();

        const u =
          document
            .getElementById(
              "adminUsername"
            )
            .value.trim();

        const p =
          document
            .getElementById(
              "adminPassword"
            )
            .value;

        if (
          u === ADMIN_USERNAME &&
          p === ADMIN_PASSWORD
        ) {
          hideLoginError();

          showToast(
            "Login successful.",
            "success"
          );

          login("admin", {});
        } else {
          showLoginError(
            "Invalid username or password."
          );
        }
      }
    );

  document
    .getElementById("studentLoginForm")
    .addEventListener(
      "submit",
      e => {
        e.preventDefault();

        const id =
          document
            .getElementById(
              "studentLoginId"
            )
            .value.trim();

        const p =
          document
            .getElementById(
              "studentPassword"
            )
            .value;

        const student =
          students.find(
            s =>
              s.loginId === id &&
              s.password === p
          );

        if (student) {
          hideLoginError();

          showToast(
            "Login successful.",
            "success"
          );

          login(
            "student",
            {
              studentId: student.id
            }
          );
        } else {
          showLoginError(
            "Invalid username or password."
          );
        }
      }
    );
}

function wireAdminApp() {
  document
    .getElementById("adminNav")
    .addEventListener(
      "click",
      e => {
        const btn =
          e.target.closest(
            ".nav-item"
          );

        if (btn) {
          switchAdminView(
            btn.dataset.view
          );
        }
      }
    );

  document
    .getElementById(
      "adminLogoutBtn"
    )
    .addEventListener(
      "click",
      logout
    );

  document
    .getElementById(
      "openAddStudentBtn"
    )
    .addEventListener(
      "click",
      openAddStudentModal
    );

  document
    .getElementById(
      "studentSearchInput"
    )
    .addEventListener(
      "input",
      renderStudentsTable
    );

  document
    .getElementById(
      "studentClassFilter"
    )
    .addEventListener(
      "change",
      renderStudentsTable
    );

  document
    .getElementById(
      "openAddHomeworkBtn"
    )
    .addEventListener(
      "click",
      openAddHomeworkModal
    );

  document
    .getElementById(
      "homeworkClassFilter"
    )
    .addEventListener(
      "change",
      renderHomeworkList
    );

  document
    .getElementById(
      "openAddTestBtn"
    )
    .addEventListener(
      "click",
      openAddTestModal
    );

  document
    .getElementById(
      "testClassFilter"
    )
    .addEventListener(
      "change",
      renderTestsList
    );

  document
    .getElementById(
      "publishResultForm"
    )
    .addEventListener(
      "submit",
      submitPublishResultForm
    );

  document
    .getElementById(
      "resultFilterClass"
    )
    .addEventListener(
      "change",
      renderResultsTable
    );

  document
    .getElementById(
      "resultFilterSubject"
    )
    .addEventListener(
      "change",
      renderResultsTable
    );

  document
    .getElementById(
      "rollSlipForm"
    )
    .addEventListener(
      "submit",
      submitRollSlipForm
    );

  document
    .getElementById(
      "printRollSlipBtn"
    )
    .addEventListener(
      "click",
      () => window.print()
    );

  document
    .getElementById(
      "allDataTabs"
    )
    .addEventListener(
      "click",
      e => {
        const chip =
          e.target.closest(
            ".chip"
          );

        if (chip) {
          renderAllDataTable(
            chip.dataset.set
          );
        }
      }
    );

  document
    .getElementById(
      "adminHamburger"
    )
    .addEventListener(
      "click",
      () => {
        document
          .getElementById(
            "adminSidebar"
          )
          .classList.add("open");

        document
          .getElementById(
            "adminBackdrop"
          )
          .classList.add("show");
      }
    );

  document
    .getElementById(
      "adminBackdrop"
    )
    .addEventListener(
      "click",
      () =>
        closeMobileSidebar(
          "admin"
        )
    );
}

function wireStudentApp() {
  document
    .getElementById("studentNav")
    .addEventListener(
      "click",
      e => {
        const btn =
          e.target.closest(
            ".nav-item"
          );

        if (btn) {
          switchStudentView(
            btn.dataset.view
          );
        }
      }
    );

  document
    .getElementById(
      "studentLogoutBtn"
    )
    .addEventListener(
      "click",
      () => {

        if (activeTestRun) {
          clearInterval(
            activeTestRun.timerHandle
          );
        }

        activeTestRun = null;

        logout();
      }
    );

  document
    .getElementById(
      "studentPrintSlipBtn"
    )
    .addEventListener(
      "click",
      () => window.print()
    );

  document
    .getElementById(
      "studentHamburger"
    )
    .addEventListener(
      "click",
      () => {

        document
          .getElementById(
            "studentSidebar"
          )
          .classList.add("open");

        document
          .getElementById(
            "studentBackdrop"
          )
          .classList.add("show");
      }
    );

  document
    .getElementById(
      "studentBackdrop"
    )
    .addEventListener(
      "click",
      () =>
        closeMobileSidebar(
          "student"
        )
    );
}

function wireModalsAndDialogs() {
  document
    .getElementById(
      "modalCloseBtn"
    )
    .addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById(
      "modalOverlay"
    )
    .addEventListener(
      "click",
      e => {
        if (
          e.target.id ===
          "modalOverlay"
        ) {
          closeModal();
        }
      }
    );

  document
    .getElementById(
      "confirmCancelBtn"
    )
    .addEventListener(
      "click",
      () =>
        resolveConfirm(false)
    );

  document
    .getElementById(
      "confirmOkBtn"
    )
    .addEventListener(
      "click",
      () =>
        resolveConfirm(true)
    );

  document.addEventListener(
    "keydown",
    e => {

      if (e.key !== "Escape") {
        return;
      }

      if (
        !document
          .getElementById(
            "modalOverlay"
          )
          .classList.contains(
            "hidden"
          )
      ) {
        closeModal();
      }

      if (
        !document
          .getElementById(
            "confirmOverlay"
          )
          .classList.contains(
            "hidden"
          )
      ) {
        resolveConfirm(false);
      }
    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadData();

    wireLoginScreen();
    wireAdminApp();
    wireStudentApp();
    wireModalsAndDialogs();

    if (restoreSession()) {
      routeToApp();
    }
  }
);
