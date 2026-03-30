// server/controllers/helperController.js
const Helper = require("../models/Helper");

// ── GET /api/helpers ──────────────────────────────────────────────────────────
// Supports query params: city, service, minPrice, maxPrice, available, verified
const getHelpers = async (req, res) => {
  try {
    const { city, service, minPrice, maxPrice, available, verified } = req.query;

    const filter = {};

    if (city      && city !== "All Cities")    filter.city    = city;
    if (service   && service !== "All Services") filter.service = service;
    if (available !== undefined) filter.available = available === "true";
    if (verified  !== undefined) filter.verified  = verified  === "true";

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const helpers = await Helper.find(filter).sort({ rating: -1 });

    res.status(200).json({ success: true, count: helpers.length, data: helpers });
  } catch (err) {
    console.error("getHelpers error:", err.message);
    res.status(500).json({ msg: "Failed to fetch helpers", error: err.message });
  }
};

// ── GET /api/helpers/me/profile ───────────────────────────────────────────────
const getMyHelperProfile = async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.user._id });
    if (!helper) {
      return res.status(404).json({
        success: false,
        msg: "No helper profile linked to this account",
      });
    }
    res.status(200).json({ success: true, data: helper });
  } catch (err) {
    console.error("getMyHelperProfile error:", err.message);
    res.status(500).json({ msg: "Failed to load profile", error: err.message });
  }
};

// ── GET /api/helpers/:id ──────────────────────────────────────────────────────
const getHelper = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }
    res.status(200).json({ success: true, data: helper });
  } catch (err) {
    console.error("getHelper error:", err.message);
    res.status(500).json({ msg: "Failed to fetch helper", error: err.message });
  }
};

// ── POST /api/helpers ─────────────────────────────────────────────────────────
// Anyone can register a new helper profile
const addHelper = async (req, res) => {
  try {
    const {
      name, phone, service, price, city, area,
      availability, about, skills, experience, avatar, gradient,
    } = req.body;

    // Attach logged-in user if available
    const helperData = {
      name, phone, service, price, city, area,
      availability, about, skills, experience, avatar, gradient,
    };
    if (req.user) helperData.user = req.user._id;

    const helper = await Helper.create(helperData);
    res.status(201).json({ success: true, data: helper });
  } catch (err) {
    console.error("addHelper error:", err.message);
    res.status(400).json({ msg: "Failed to create helper", error: err.message });
  }
};

// ── PUT /api/helpers/:id ──────────────────────────────────────────────────────
// Update helper profile (owner or admin only — kept simple here)
const updateHelper = async (req, res) => {
  try {
    const helper = await Helper.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!helper) return res.status(404).json({ msg: "Helper not found" });
    res.status(200).json({ success: true, data: helper });
  } catch (err) {
    console.error("updateHelper error:", err.message);
    res.status(400).json({ msg: "Failed to update helper", error: err.message });
  }
};

// ── DELETE /api/helpers/:id ───────────────────────────────────────────────────
const deleteHelper = async (req, res) => {
  try {
    const helper = await Helper.findByIdAndDelete(req.params.id);
    if (!helper) return res.status(404).json({ msg: "Helper not found" });
    res.status(200).json({ success: true, msg: "Helper deleted" });
  } catch (err) {
    console.error("deleteHelper error:", err.message);
    res.status(500).json({ msg: "Failed to delete helper", error: err.message });
  }
};

module.exports = {
  getHelpers,
  getMyHelperProfile,
  getHelper,
  addHelper,
  updateHelper,
  deleteHelper,
};