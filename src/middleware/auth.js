const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { role: 'admin' } or { role: 'student', studentId }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

// Student can access own data, admin can access anything
function requireSelfOrAdmin(getStudentId) {
  return (req, res, next) => {
    if (req.user.role === "admin") return next();

    const targetId = getStudentId(req);
    if (req.user.role === "student" && req.user.studentId === Number(targetId)) {
      return next();
    }
    return res.status(403).json({ error: "Not allowed to access this resource." });
  };
}

module.exports = { requireAuth, requireAdmin, requireSelfOrAdmin, JWT_SECRET };
