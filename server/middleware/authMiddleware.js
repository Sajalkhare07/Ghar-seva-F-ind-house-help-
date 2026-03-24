// server/middleware/authMiddleware.js
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Protect routes — must be logged in ────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Accept token from Authorization header: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authorised — no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user (without password) to request object
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ msg: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Not authorised — invalid token" });
  }
};

// ── Role guard — restrict to specific roles ───────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: `Access denied. Role "${req.user.role}" is not allowed.` });
    }
    next();
  };
};

module.exports = { protect, restrictTo };