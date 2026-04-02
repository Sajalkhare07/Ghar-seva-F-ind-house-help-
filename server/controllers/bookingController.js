const Booking = require("../models/Booking");
const Helper = require("../models/Helper");

const createBooking = async (req, res) => {
  try {
    const { helperId, message, startDate, monthlyBudget } = req.body;

    if (!helperId) {
      return res.status(400).json({ msg: "helperId is required" });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    if (helper.user && String(helper.user) === String(req.user._id)) {
      return res.status(400).json({ msg: "You cannot book your own helper profile" });
    }

    const existing = await Booking.findOne({
      user: req.user._id,
      helper: helperId,
      status: "pending",
    });

    if (existing) {
      return res
        .status(400)
        .json({ msg: "You already have a pending request for this helper" });
    }

    let parsedStart;
    if (startDate != null && startDate !== "") {
      parsedStart = new Date(startDate);
      if (Number.isNaN(parsedStart.getTime())) {
        return res.status(400).json({ msg: "Invalid start date" });
      }
    }

    let parsedBudget;
    if (monthlyBudget != null && monthlyBudget !== "") {
      parsedBudget = Number(monthlyBudget);
      if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
        return res.status(400).json({ msg: "Monthly budget must be a valid positive number" });
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      helper: helperId,
      message: typeof message === "string" ? message.trim() : "",
      startDate: parsedStart,
      monthlyBudget: parsedBudget,
    });

    await booking.populate(["user", "helper"]);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("createBooking error:", err.message);
    res.status(500).json({ msg: "Failed to create booking", error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("helper", "name service city area price rating verified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getMyBookings error:", err.message);
    res.status(500).json({ msg: "Failed to fetch bookings", error: err.message });
  }
};

const getHelperRequests = async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.user._id });
    if (!helper) {
      return res.status(404).json({ msg: "Helper profile not found" });
    }

    const bookings = await Booking.find({ helper: helper._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getHelperRequests error:", err.message);
    res.status(500).json({ msg: "Failed to fetch requests", error: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    const helperProfile = await Helper.findOne({
      _id: booking.helper,
      user: req.user._id,
    });

    if (!helperProfile) {
      return res.status(403).json({
        msg: "You can only update bookings linked to your helper profile",
      });
    }

    booking.status = status;
    await booking.save();

    await booking.populate([
      { path: "user", select: "name email" },
      { path: "helper", select: "name service city area price" },
    ]);

    res.status(200).json({
      success: true,
      data: booking,
    });
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
