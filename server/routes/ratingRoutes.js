// server/routes/ratingRoutes.js
const express = require("express");
const router  = express.Router();

const {
  submitRating,
  getHelperRatings,
  getMyRating,
} = require("../controllers/ratingController");

const { protect } = require("../middleware/authMiddleware");

// POST /api/ratings              → submit or update a rating (must be logged in)
router.post("/", protect, submitRating);

// GET  /api/ratings/:helperId         → get all ratings for a helper (public)
router.get("/:helperId", getHelperRatings);

// GET  /api/ratings/:helperId/mine    → get YOUR rating for a helper (logged in)
router.get("/:helperId/mine", protect, getMyRating);

module.exports = router;