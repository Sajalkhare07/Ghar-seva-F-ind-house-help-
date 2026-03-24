const express = require("express");
const router  = express.Router();
const {
  createBooking,
  getMyBookings,
  getHelperRequests,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/",                  createBooking);
router.get("/mine",               getMyBookings);
router.get("/helper-requests",    getHelperRequests);
router.patch("/:id/status",       updateBookingStatus);

module.exports = router;
