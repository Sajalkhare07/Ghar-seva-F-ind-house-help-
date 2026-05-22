const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getHelperRequests,
  updateBookingStatus,
  addMessage,
  createCallRequest,
  updateCallRequest,
  addAttendance,
  addPayment,
  addWeeklyReview,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createBooking);
router.get("/mine", getMyBookings);
router.get("/helper-requests", getHelperRequests);
router.patch("/:id/status", updateBookingStatus);
router.post("/:id/messages", addMessage);
router.post("/:id/call-requests", createCallRequest);
router.patch("/:id/call-requests/:callId", updateCallRequest);
router.post("/:id/attendance", addAttendance);
router.post("/:id/payments", addPayment);
router.post("/:id/weekly-reviews", addWeeklyReview);

module.exports = router;