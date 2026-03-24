// server/models/Helper.js
const mongoose = require("mongoose");

const HelperSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },
    phone: {
      type:     String,
      required: [true, "Phone number is required"],
      trim:     true,
    },
    service: {
      type:     String,
      enum:     ["Maid", "Cook", "Cleaner", "Cook+Maid"],
      required: [true, "Service type is required"],
    },
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [500, "Minimum price is ₹500"],
    },
    city: {
      type:     String,
      required: [true, "City is required"],
      enum:     ["Indore", "Bhopal", "Delhi", "Mumbai", "Pune", "Hyderabad"],
    },
    area: {
      type:     String,
      required: [true, "Area/locality is required"],
      trim:     true,
    },
    availability: {
      type:    String,
      enum:    ["Morning (6-10 AM)", "Afternoon (1-4 PM)", "Evening (6-9 PM)", "Full Day"],
      default: "Morning (6-10 AM)",
    },
    about: {
      type:    String,
      default: "",
      trim:    true,
    },
    skills: {
      type:    [String],
      default: [],
    },
    experience: {
      type:    String,
      default: "New",
    },
    avatar: {
      type:    String,
      default: "",
    },
    gradient: {
      type:    String,
      default: "linear-gradient(135deg,#667eea,#764ba2)",
    },

    // Rating fields
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },
    reviews: {
      type:    Number,
      default: 0,
    },

    // Status flags
    available: {
      type:    Boolean,
      default: true,
    },
    verified: {
      type:    Boolean,
      default: false,
    },

    // Reference to the User who registered as a helper
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
  },
  { timestamps: true }
);

// Index for fast city + service queries
HelperSchema.index({ city: 1, service: 1 });
HelperSchema.index({ rating: -1 });

module.exports = mongoose.model("Helper", HelperSchema);