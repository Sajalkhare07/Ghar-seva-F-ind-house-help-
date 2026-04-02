const Rating = require("../models/Rating");
const Helper = require("../models/Helper");

const submitRating = async (req, res) => {
  try {
    const { helperId, rating, review } = req.body;

    if (!helperId) {
      return res.status(400).json({ msg: "helperId is required" });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    const cleanReview = typeof review === "string" ? review.trim() : "";
    if (cleanReview.length > 300) {
      return res.status(400).json({ msg: "Review must be 300 characters or fewer" });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    await Rating.findOneAndUpdate(
      { helper: helperId, user: req.user._id },
      { rating: numericRating, review: cleanReview },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const allRatings = await Rating.find({ helper: helperId });
    const count = allRatings.length;
    const avgRating =
      count > 0
        ? Math.round(
            (allRatings.reduce((sum, r) => sum + r.rating, 0) / count) * 10
          ) / 10
        : 0;

    const updatedHelper = await Helper.findByIdAndUpdate(
      helperId,
      { rating: avgRating, reviews: count },
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: "Rating submitted successfully",
      data: {
        newRating: avgRating,
        totalReviews: count,
        helper: updatedHelper,
      },
    });
  } catch (err) {
    console.error("submitRating error:", err.message);
    res.status(500).json({ msg: "Failed to submit rating", error: err.message });
  }
};

const getHelperRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ helper: req.params.helperId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (err) {
    console.error("getHelperRatings error:", err.message);
    res.status(500).json({ msg: "Failed to get ratings", error: err.message });
  }
};

const getMyRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      helper: req.params.helperId,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: rating || null,
    });
  } catch (err) {
    console.error("getMyRating error:", err.message);
    res.status(500).json({ msg: "Failed to get your rating", error: err.message });
  }
};

module.exports = { submitRating, getHelperRatings, getMyRating };
