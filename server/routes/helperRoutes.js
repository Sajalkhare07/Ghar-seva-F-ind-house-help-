const express = require("express");
const router  = express.Router();
const {
  getHelpers,
  getHelper,
  addHelper,
  updateHelper,
  deleteHelper,
} = require("../controllers/helperController");
const { protect } = require("../middleware/authMiddleware");

router.get("/",     getHelpers);
router.get("/:id",  getHelper);
router.post("/",    addHelper);
router.put("/:id",  protect, updateHelper);
router.delete("/:id", protect, deleteHelper);

module.exports = router;
