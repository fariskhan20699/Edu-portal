const student = students.find(
  s => s.id === studentId
);

const test = tests.find(
  t => t.id === testId
);

if (!student || !test) {
  showToast(
    "Invalid student or test selected.",
    "error"
  );
  return false;
}

if (student.className !== className) {
  showToast(
    "Selected student does not belong to this class.",
    "error"
  );
  return false;
}

if (test.className !== className) {
  showToast(
    "Selected test does not belong to this class.",
    "error"
  );
  return false;
}

const existingResult = results.find(
  r =>
    r.studentDbId === studentId &&
    r.testId === testId
);

if (existingResult) {
  showToast(
    "A result already exists for this student and test.",
    "error"
  );
  return false;
}
