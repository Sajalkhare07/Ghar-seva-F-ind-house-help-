const mongoose = require("mongoose");

const HiringDecisionSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    decisionType: {
      type: String,
      enum: ["thinking", "trial"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "trial_scheduled", "trial_completed", "hired", "closed"],
      default: "open",
    },
    trialDate: {
      type: Date,
      default: null,
    },
    trialTiming: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1200,
    },
  },
  { timestamps: true }
);

HiringDecisionSchema.index({ user: 1, helper: 1, decisionType: 1, status: 1 });

module.exports = mongoose.model("HiringDecision", HiringDecisionSchema);
