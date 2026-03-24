// server/controllers/authController.js
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Helper: build and send token response ─────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    // Create user (password is hashed inside the User model pre-save hook)
    const user = await User.create({ name, email, password, role });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error during signup", error: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    // Explicitly select password (excluded by default in schema)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error during login", error: err.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { signup, login, getMe };