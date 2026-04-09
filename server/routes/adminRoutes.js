const express = require("express");
const router = express.Router();

const { getOverview, reviewHelper } = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect, restrictTo("admin"));

router.get("/overview", getOverview);
router.patch("/helpers/:id/review", reviewHelper);

module.exports = router;
