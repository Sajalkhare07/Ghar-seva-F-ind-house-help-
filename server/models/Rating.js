// server/models/Rating.js
const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    helper: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Helper",
      required: true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },
    review: {
      type:    String,
      default: "",
      trim:    true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

// One user can only rate a helper once
// If they rate again it updates their existing rating
RatingSchema.index({ helper: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Rating", RatingSchema);