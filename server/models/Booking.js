const mongoose = require("mongoose");

const BookingMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "helper"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
  },
  { _id: true, timestamps: true }
);

const CallRequestSchema = new mongoose.Schema(
  {
    requestedByRole: {
      type: String,
      enum: ["user", "helper"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 400,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

const AttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      default: "present",
    },
    markedByRole: {
      type: String,
      enum: ["user", "helper"],
      required: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  { _id: true, timestamps: true }
);

const PaymentSchema = new mongoose.Schema(
  {
    monthLabel: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["paid", "pending"],
      default: "paid",
    },
    paidOn: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  { _id: true, timestamps: true }
);

const WeeklyReviewSchema = new mongoose.Schema(
  {
    weekLabel: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1200,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true }
);

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    helper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Helper",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "active", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    monthlyBudget: {
      type: Number,
      default: null,
    },
    contactNumber: {
      type: String,
      default: "",
      trim: true,
    },
    serviceStartedAt: {
      type: Date,
      default: null,
    },
    messages: {
      type: [BookingMessageSchema],
      default: [],
    },
    callRequests: {
      type: [CallRequestSchema],
      default: [],
    },
    attendance: {
      type: [AttendanceSchema],
      default: [],
    },
    payments: {
      type: [PaymentSchema],
      default: [],
    },
    weeklyReviews: {
      type: [WeeklyReviewSchema],
      default: [],
    },
  },
  { timestamps: true }
);

BookingSchema.index({ user: 1, helper: 1, status: 1 });

module.exports = mongoose.model("Booking", BookingSchema);