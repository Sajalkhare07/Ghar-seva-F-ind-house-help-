// // server/routes/helperRoutes.js
// const express = require("express");
// const router  = express.Router();

// const {
//   getHelpers,
//   getHelper,
//   addHelper,
//   updateHelper,
//   deleteHelper,
// } = require("../controllers/helperController");

// const { protect } = require("../middleware/authMiddleware");

// // GET  /api/helpers         → list all helpers (with optional filters)
// router.get("/", getHelpers);

// // GET  /api/helpers/:id     → single helper profile
// router.get("/:id", getHelper);

// // POST /api/helpers         → register a new helper (public, but attaches user if logged in)
// router.post("/", addHelper);

// // PUT  /api/helpers/:id     → update helper profile (must be logged in)
// router.put("/:id", protect, updateHelper);

// // DELETE /api/helpers/:id   → delete helper profile (must be logged in)
// router.delete("/:id", protect, deleteHelper);

// module.exports = router;

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

const { protect, optionalAuth } = require("../middleware/authMiddleware");

router.get("/me/profile", protect, getMyHelperProfile);
router.get("/", getHelpers);
router.get("/:id", getHelper);
router.post("/", optionalAuth, addHelper);
router.put("/:id", protect, updateHelper);
router.delete("/:id", protect, deleteHelper);

module.exports = router;
