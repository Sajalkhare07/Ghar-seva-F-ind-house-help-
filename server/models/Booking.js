// server/models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    helper: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Helper",
      required: true,
    },
    status: {
      type:    String,
      enum:    ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    message: {
      type:    String,
      default: "",
      trim:    true,
    },
    startDate: {
      type: Date,
    },
    monthlyBudget: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);