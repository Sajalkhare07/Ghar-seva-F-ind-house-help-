// server/controllers/authController.js
const jwt  = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    if (user.authProvider === "google") {
      return res.status(400).json({
        msg: "This account uses Google sign-in. Please continue with Google.",
      });
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

// ── POST /api/auth/google ─────────────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ msg: "Google credential is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ msg: "Google auth is not configured on server" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ msg: "Google account email is not verified" });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        role: role || "user",
        authProvider: "google",
        googleId: payload.sub,
      });
    } else if (user.authProvider === "local") {
      user.authProvider = "google";
      user.googleId = payload.sub;
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ msg: "Google authentication failed", error: err.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { signup, login, googleAuth, getMe };