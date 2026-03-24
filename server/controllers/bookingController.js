// server/controllers/bookingController.js
const Booking = require("../models/Booking");
const Helper  = require("../models/Helper");

// ── POST /api/bookings ────────────────────────────────────────────────────────
// Logged-in user sends a booking request for a helper
const createBooking = async (req, res) => {
  try {
    const { helperId, message, startDate, monthlyBudget } = req.body;

    // Verify helper exists
    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    // Prevent duplicate pending bookings for the same helper
    const existing = await Booking.findOne({
      user:   req.user._id,
      helper: helperId,
      status: "pending",
    });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "You already have a pending request for this helper" });
    }

    const booking = await Booking.create({
      user:          req.user._id,
      helper:        helperId,
      message,
      startDate,
      monthlyBudget,
    });

    await booking.populate(["user", "helper"]);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error("createBooking error:", err.message);
    res.status(500).json({ msg: "Failed to create booking", error: err.message });
  }
};

// ── GET /api/bookings/mine ────────────────────────────────────────────────────
// Returns all bookings made by the logged-in user
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("helper", "name service city area price rating verified")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error("getMyBookings error:", err.message);
    res.status(500).json({ msg: "Failed to fetch bookings", error: err.message });
  }
};

// ── GET /api/bookings/helper-requests ────────────────────────────────────────
// Returns bookings received by the logged-in helper
const getHelperRequests = async (req, res) => {
  try {
    // Find the helper profile linked to this user
    const helper = await Helper.findOne({ user: req.user._id });
    if (!helper) {
      return res.status(404).json({ msg: "Helper profile not found" });
    }

    const bookings = await Booking.find({ helper: helper._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error("getHelperRequests error:", err.message);
    res.status(500).json({ msg: "Failed to fetch requests", error: err.message });
  }
};

// ── PATCH /api/bookings/:id/status ────────────────────────────────────────────
// Helper accepts or rejects a booking
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("updateBookingStatus error:", err.message);
    res.status(500).json({ msg: "Failed to update booking", error: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getHelperRequests,
  updateBookingStatus,
};