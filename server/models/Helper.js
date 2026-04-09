const mongoose = require("mongoose");

const HelperDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const HelperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    service: {
      type: String,
      enum: ["Maid", "Cook", "Cleaner", "Cook+Maid"],
      required: [true, "Service type is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [500, "Minimum price is Rs.500"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      enum: ["Indore", "Bhopal", "Delhi", "Mumbai", "Pune", "Hyderabad"],
    },
    area: {
      type: String,
      required: [true, "Area/locality is required"],
      trim: true,
    },
    availability: {
      type: String,
      enum: ["Morning (6-10 AM)", "Afternoon (1-4 PM)", "Evening (6-9 PM)", "Full Day"],
      default: "Morning (6-10 AM)",
    },
    about: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: "New",
    },
    avatar: {
      type: String,
      default: "",
    },
    gradient: {
      type: String,
      default: "linear-gradient(135deg,#667eea,#764ba2)",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalNotes: {
      type: String,
      default: "",
      trim: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
      trim: true,
    },
    currentAddress: {
      type: String,
      required: [true, "Current address is required"],
      trim: true,
    },
    emergencyContactName: {
      type: String,
      required: [true, "Emergency contact name is required"],
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      required: [true, "Emergency contact phone is required"],
      trim: true,
    },
    verificationDocuments: {
      type: [HelperDocumentSchema],
      default: [],
      validate: {
        validator: (docs) => Array.isArray(docs) && docs.length >= 3,
        message: "At least three verification documents are required",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

HelperSchema.index({ city: 1, service: 1 });
HelperSchema.index({ rating: -1 });
HelperSchema.index({ verificationStatus: 1, verified: 1 });

module.exports = mongoose.model("Helper", HelperSchema);
