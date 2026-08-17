# 🏫 Home Academy | Educational Portal

A modern and responsive **School Management & Educational Portal** built using **HTML5, CSS3, and Vanilla JavaScript**.

Home Academy is designed to help schools manage students from **Class 3 to Class 6**, including student records, homework, online tests, examination results, and roll number slips.

---

## 🚀 Features

### 👨‍💼 Admin Portal

- 📊 Admin Dashboard
- 👨‍🎓 Student Management
- ➕ Add New Students
- ✏️ Edit Student Information
- 👁️ View Student Details
- 🗑️ Delete Students
- 🔎 Search Students
- 📚 Class wise Student Management
- 📝 Homework Management
- 🧪 Test Management
- 📊 Result Management
- ✅ Automatic Percentage Calculation
- 🏆 Automatic Grade Calculation
- 📈 Pass / Fail Status
- 🎫 Roll Number Slip Generation
- 🖨️ Print Roll Number Slips
- 🗃️ View All Stored Data
- 🚪 Admin Logout

---

### 👨‍🎓 Student Portal

Students can log in using their individual credentials and access:

- 📊 Student Dashboard
- 👤 My Profile
- 📚 Homework
- 🧪 Available Tests
- 📝 Online Tests
- 📊 Examination Results
- 🎫 Roll Number Slip
- 🚪 Logout

---

## 📚 Supported Classes

The current system supports:

- Class 3
- Class 4
- Class 5
- Class 6

---

## 📝 Homework Management

Admin can create homework assignments with:

- Homework Title
- Subject
- Class
- Description
- Due Date

Students can view homework assigned to their respective class.

---

## 🧪 Online Test System

The system supports online multiple-choice tests.

Each test can contain:

- Test Title
- Subject
- Class
- Total Marks
- Test Duration
- Test Date
- Multiple Questions
- Multiple Options
- Correct Answers

---

## 📊 Result Management

Admin can publish results by selecting:

- Class
- Student
- Test
- Total Marks
- Obtained Marks

The system automatically calculates:

- Percentage
- Grade
- Pass / Fail Status

### Grading System

| Percentage | Grade |
|------------|-------|
| 90% – 100% | A+    |
| 80% – 89%  | A     |
| 70% – 79%  | B     |
| 60% – 69%  | C     |
| 50% – 59%  | D     |
| Below 50%  | F     |

**Passing Percentage: 50%**

---

## 🎫 Roll Number Slip

Admin can generate examination roll number slips containing:

- Student Name
- Father's Name
- Class
- Roll Number
- Student ID
- Examination Name
- Examination Date
- Subjects
- Examination Instructions
- Principal Signature Area
- Official Seal Area

The generated slip can be printed using the browser's print functionality.

---

## 💾 Data Storage

This project is currently a **frontend-only application**.

It uses:

- `localStorage` for application data
- `sessionStorage` for login sessions

The following data is stored locally:

- Students
- Homework
- Tests
- Results
- Roll Number Slips

> ⚠️ Data is stored only in the current browser/device. There is currently no online database or backend server.

---

## 🔐 Login System

The application provides separate Admin and Student login systems.

### Admin Login

```text
Username: admin
Password: *******
```

### Demo Student Login

```text
Login ID: ali101
Password: *******
```

> ⚠️ The current authentication system is designed for educational/demo purposes. Credentials are stored on the client side and should not be considered production level security.

---

## 🎨 UI & Design

The portal includes:

- Modern Dashboard UI
- Responsive Design
- Sidebar Navigation
- Mobile Hamburger Menu
- Dashboard Cards
- Data Tables
- Forms
- Modal Windows
- Toast Notifications
- Confirmation Dialogs
- Responsive Layout
- Modern Academic Theme

---

## 📱 Responsive Design

The application is designed to work on:

- 💻 Desktop
- 💻 Laptop
- 📱 Mobile
- 📟 Tablet

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript (ES6+)

### Browser APIs

- LocalStorage
- SessionStorage
- DOM API
- Browser Print API

---

## 📂 Project Structure

```text
home-acedmy/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### `index.html`

Contains the complete structure of the educational portal.

### `style.css`

Contains the complete styling, responsive design, dashboard layout, forms, tables, sidebar, login screen, and other UI components.

### `script.js`

Handles:

- Authentication
- Student Management
- Homework
- Tests
- Results
- Grading
- Roll Number Slips
- LocalStorage
- SessionStorage
- Dashboard Rendering
- Student Portal
- Admin Portal

---

## 🚀 How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/fariskhan20699/home-acedmy.git
```

### 2. Open the Project

```bash
cd home-acedmy
```

### 3. Run the Website

Open:

```text
index.html
```

directly in your browser.

You can also use **VS Code Live Server** for development.

---

## 🔮 Future Improvements

Future versions may include:

- 🔐 Secure Backend Authentication
- 🗄️ MySQL / PostgreSQL Database
- 👨‍🏫 Teacher Accounts
- 👨‍👩‍👧 Parent Accounts
- 📅 Attendance Management
- 💰 Fee Management
- 🗓️ Timetable Management
- 📄 PDF Report Cards
- 📸 Student Photos
- ☁️ Cloud Storage
- 📧 Email Notifications
- 📱 SMS Notifications
- 🌐 Online Deployment
- 🔗 REST API
- 👥 Multiple Admin Roles

---

## 🎯 Project Purpose

This project was created as an educational and portfolio project to demonstrate practical web development concepts such as:

- DOM Manipulation
- JavaScript
- CRUD Operations
- Form Handling
- Data Validation
- Client side Authentication
- LocalStorage
- SessionStorage
- Responsive Web Design
- Dynamic UI Rendering
- Browser based Data Persistence

---

## 👨‍💻 Developer

**Muahmmad Faris Khan**

Computer Science Student

---

## 📄 License

This project is created for **Educational and portfolio purposes**.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

### 🏫 Home Academy

**Simple • Organized • Digital School Management**
