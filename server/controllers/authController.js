const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Helper = require("../models/Helper");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      savedHelpers: user.savedHelpers || [],
    },
  });
};

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const signup = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    password = typeof password === "string" ? password : "";
    role = typeof role === "string" ? role : "user";

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Name, email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    if (!["user", "helper"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role selected" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    const user = await User.create({ name, email, password, role });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error during signup", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    password = typeof password === "string" ? password : "";

    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "Please enter a valid email address" });
    }

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
        role: role === "helper" ? "helper" : "user",
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

const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const getSavedHelpers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedHelpers");

    res.status(200).json({
      success: true,
      count: user.savedHelpers.length,
      data: user.savedHelpers,
    });
  } catch (err) {
    console.error("getSavedHelpers error:", err.message);
    res.status(500).json({ msg: "Failed to load saved helpers", error: err.message });
  }
};

const toggleSavedHelper = async (req, res) => {
  try {
    const { helperId } = req.body;

    if (!helperId) {
      return res.status(400).json({ msg: "helperId is required" });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    const user = await User.findById(req.user._id);
    const exists = user.savedHelpers.some((id) => String(id) === String(helperId));

    if (exists) {
      user.savedHelpers = user.savedHelpers.filter(
        (id) => String(id) !== String(helperId)
      );
    } else {
      user.savedHelpers.push(helperId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      saved: !exists,
      savedHelpers: user.savedHelpers,
      msg: exists ? "Helper removed from saved" : "Helper saved successfully",
    });
  } catch (err) {
    console.error("toggleSavedHelper error:", err.message);
    res.status(500).json({ msg: "Failed to update saved helpers", error: err.message });
  }
};

module.exports = {
  signup,
  login,
  googleAuth,
  getMe,
  getSavedHelpers,
  toggleSavedHelper,
};
