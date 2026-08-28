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

module.exports = { calculateGrade, calculateStatus, PASS_PERCENT };
