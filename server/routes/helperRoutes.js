const express = require("express");
const router  = express.Router();
const {
  getHelpers,
  getMyHelperProfile,
  getHelper,
  addHelper,
  updateHelper,
  deleteHelper,
} = require("../controllers/helperController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

router.get("/me/profile", protect, getMyHelperProfile);
router.get("/",     getHelpers);
router.get("/:id",  getHelper);
router.post("/",    optionalAuth, addHelper);
router.put("/:id",  protect, updateHelper);
router.delete("/:id", protect, deleteHelper);

module.exports = router;
