const express = require("express");
const router = express.Router();

const {
  getHelpers,
  getMyHelperProfile,
  getHelper,
  addHelper,
  updateHelper,
  deleteHelper,
} = require("../controllers/helperController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

router.get("/me/profile", protect, getMyHelperProfile);
router.get("/", getHelpers);
router.get("/:id", getHelper);
router.post("/", protect, restrictTo("helper", "admin"), addHelper);
router.put("/:id", protect, restrictTo("helper", "admin"), updateHelper);
router.delete("/:id", protect, restrictTo("helper", "admin"), deleteHelper);

module.exports = router;
