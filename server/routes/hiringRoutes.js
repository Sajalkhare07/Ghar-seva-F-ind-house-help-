const express = require("express");
const router = express.Router();

const {
  addEmploymentAttendance,
  addEmploymentWeeklyReview,
  createPendingDecision,
  getHiringDashboard,
  hireHelper,
  scheduleTrial,
  updatePrivateNotes,
  upsertSalaryStatus,
} = require("../controllers/hiringController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect, restrictTo("user"));

router.get("/dashboard", getHiringDashboard);
router.post("/pending", createPendingDecision);
router.post("/trials", scheduleTrial);
router.post("/employments", hireHelper);
router.post("/employments/:id/attendance", addEmploymentAttendance);
router.patch("/employments/:id/salary", upsertSalaryStatus);
router.post("/employments/:id/weekly-reviews", addEmploymentWeeklyReview);
router.patch("/employments/:id/notes", updatePrivateNotes);

module.exports = router;
