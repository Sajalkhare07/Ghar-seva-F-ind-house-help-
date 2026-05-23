const mongoose = require("mongoose");

const EmploymentAttendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, trim: true },
    status: { type: String, enum: ["present", "absent"], required: true },
    note: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { _id: true, timestamps: true }
);

const EmploymentSalarySchema = new mongoose.Schema(
  {
    monthLabel: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    dueDate: { type: Date, default: null },
    paidOn: { type: Date, default: null },
  },
  { _id: true, timestamps: true }
);

const EmploymentWeeklyReviewSchema = new mongoose.Schema(
  {
    weekLabel: { type: String, required: true, trim: true },
    punctuality: { type: Number, min: 1, max: 5, required: true },
    behavior: { type: Number, min: 1, max: 5, required: true },
    workQuality: { type: Number, min: 1, max: 5, required: true },
    consistency: { type: Number, min: 1, max: 5, required: true },
    notes: { type: String, default: "", trim: true, maxlength: 1200 },
  },
  { _id: true, timestamps: true }
);

const EmploymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: "Helper", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    joiningDate: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
    role: { type: String, required: true, trim: true, maxlength: 80 },
    workingHours: { type: String, required: true, trim: true, maxlength: 120 },
    employmentStatus: { type: String, enum: ["active", "paused", "ended"], default: "active" },
    salaryTracker: { type: [EmploymentSalarySchema], default: [] },
    attendance: { type: [EmploymentAttendanceSchema], default: [] },
    weeklyReviews: { type: [EmploymentWeeklyReviewSchema], default: [] },
    privateNotes: { type: String, default: "", trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

EmploymentSchema.index({ user: 1, helper: 1, employmentStatus: 1 });

module.exports = mongoose.model("Employment", EmploymentSchema);
