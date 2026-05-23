const Booking = require("../models/Booking");
const Employment = require("../models/Employment");
const Helper = require("../models/Helper");
const HiringDecision = require("../models/HiringDecision");

const POPULATE_DECISION = [
  { path: "helper", select: "name service city area price rating verified verificationStatus livePhoto avatar availability" },
  { path: "booking", select: "status messages callRequests updatedAt" },
];

const POPULATE_EMPLOYMENT = [
  { path: "helper", select: "name service city area price rating verified verificationStatus livePhoto avatar availability" },
  { path: "booking", select: "status messages callRequests updatedAt" },
];

const trimText = (value, max = 1200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const parseDateValue = (value) => {
  if (value == null || value === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const loadAvailableHelper = async (helperId, userId) => {
  const helper = helperId ? await Helper.findById(helperId) : null;
  if (!helper || helper.verificationStatus !== "approved") {
    return { error: { code: 404, msg: "Approved helper not found" } };
  }
  if (helper.user && String(helper.user) === String(userId)) {
    return { error: { code: 400, msg: "You cannot hire your own helper profile" } };
  }
  return { helper };
};

const ensureConnection = async ({ userId, helper, message }) => {
  const existing = await Booking.findOne({
    user: userId,
    helper: helper._id,
    status: { $in: ["pending", "accepted", "active"] },
  }).sort({ updatedAt: -1, createdAt: -1 });

  if (existing) return existing;

  const introMessage = trimText(message, 600);
  return Booking.create({
    user: userId,
    helper: helper._id,
    status: "accepted",
    message: introMessage || "Post-call hiring workflow started.",
    monthlyBudget: helper.price,
    contactNumber: "post-call-workflow",
    messages: introMessage
      ? [{ sender: userId, senderRole: "user", text: introMessage }]
      : [],
  });
};

const getHiringDashboard = async (req, res) => {
  try {
    const [pendingDecisions, trials, employments] = await Promise.all([
      HiringDecision.find({
        user: req.user._id,
        decisionType: "thinking",
        status: { $in: ["open", "trial_scheduled"] },
      }).populate(POPULATE_DECISION).sort({ updatedAt: -1 }),
      HiringDecision.find({
        user: req.user._id,
        decisionType: "trial",
        status: { $in: ["open", "trial_scheduled", "trial_completed"] },
      }).populate(POPULATE_DECISION).sort({ trialDate: 1, updatedAt: -1 }),
      Employment.find({
        user: req.user._id,
        employmentStatus: { $in: ["active", "paused"] },
      }).populate(POPULATE_EMPLOYMENT).sort({ joiningDate: -1, updatedAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: { pendingDecisions, trials, employments },
    });
  } catch (err) {
    console.error("getHiringDashboard error:", err.message);
    res.status(500).json({ msg: "Failed to load hiring dashboard", error: err.message });
  }
};

const createPendingDecision = async (req, res) => {
  try {
    const { helperId, notes } = req.body;
    const result = await loadAvailableHelper(helperId, req.user._id);
    if (result.error) return res.status(result.error.code).json({ msg: result.error.msg });

    const booking = await ensureConnection({
      userId: req.user._id,
      helper: result.helper,
      message: "I am still thinking about hiring after our call.",
    });

    const decision = await HiringDecision.findOneAndUpdate(
      { user: req.user._id, helper: result.helper._id, decisionType: "thinking", status: { $in: ["open", "trial_scheduled"] } },
      { user: req.user._id, helper: result.helper._id, booking: booking._id, decisionType: "thinking", status: "open", notes: trimText(notes) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate(POPULATE_DECISION);

    res.status(201).json({ success: true, data: decision });
  } catch (err) {
    console.error("createPendingDecision error:", err.message);
    res.status(500).json({ msg: "Failed to save pending decision", error: err.message });
  }
};

const scheduleTrial = async (req, res) => {
  try {
    const { helperId, trialDate, trialTiming, notes } = req.body;
    const result = await loadAvailableHelper(helperId, req.user._id);
    if (result.error) return res.status(result.error.code).json({ msg: result.error.msg });

    const parsedTrialDate = parseDateValue(trialDate);
    if (!parsedTrialDate) return res.status(400).json({ msg: "Valid trial date is required" });

    const cleanTiming = trimText(trialTiming, 120);
    if (!cleanTiming) return res.status(400).json({ msg: "Trial timing is required" });

    const booking = await ensureConnection({
      userId: req.user._id,
      helper: result.helper,
      message: `Trial scheduled for ${parsedTrialDate.toLocaleDateString()} (${cleanTiming}).`,
    });

    const decision = await HiringDecision.findOneAndUpdate(
      { user: req.user._id, helper: result.helper._id, decisionType: "trial", status: { $in: ["open", "trial_scheduled", "trial_completed"] } },
      { user: req.user._id, helper: result.helper._id, booking: booking._id, decisionType: "trial", status: "trial_scheduled", trialDate: parsedTrialDate, trialTiming: cleanTiming, notes: trimText(notes) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate(POPULATE_DECISION);

    res.status(201).json({ success: true, data: decision });
  } catch (err) {
    console.error("scheduleTrial error:", err.message);
    res.status(500).json({ msg: "Failed to schedule trial", error: err.message });
  }
};

const hireHelper = async (req, res) => {
  try {
    const { helperId, joiningDate, salary, role, workingHours, dueDate } = req.body;
    const result = await loadAvailableHelper(helperId, req.user._id);
    if (result.error) return res.status(result.error.code).json({ msg: result.error.msg });

    const parsedJoiningDate = parseDateValue(joiningDate) || new Date();
    const parsedSalary = Number(salary ?? result.helper.price);
    const cleanRole = trimText(role || result.helper.service, 80);
    const cleanWorkingHours = trimText(workingHours || result.helper.availability, 120);

    if (!Number.isFinite(parsedSalary) || parsedSalary < 0) return res.status(400).json({ msg: "Salary must be valid" });
    if (!cleanRole || !cleanWorkingHours) return res.status(400).json({ msg: "Role and working hours are required" });

    const booking = await ensureConnection({ userId: req.user._id, helper: result.helper, message: "Hiring confirmed after our call." });
    booking.status = "active";
    if (!booking.serviceStartedAt) booking.serviceStartedAt = parsedJoiningDate;
    await booking.save();

    const monthLabel = parsedJoiningDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
    let employment = await Employment.findOne({ user: req.user._id, helper: result.helper._id, employmentStatus: { $in: ["active", "paused"] } });

    if (!employment) {
      employment = await Employment.create({
        user: req.user._id,
        helper: result.helper._id,
        booking: booking._id,
        joiningDate: parsedJoiningDate,
        salary: parsedSalary,
        role: cleanRole,
        workingHours: cleanWorkingHours,
        employmentStatus: "active",
        salaryTracker: [{ monthLabel, amount: parsedSalary, status: "unpaid", dueDate: parseDateValue(dueDate) }],
      });
    } else {
      employment.booking = booking._id;
      employment.joiningDate = parsedJoiningDate;
      employment.salary = parsedSalary;
      employment.role = cleanRole;
      employment.workingHours = cleanWorkingHours;
      employment.employmentStatus = "active";
      if (!employment.salaryTracker.length) {
        employment.salaryTracker.push({ monthLabel, amount: parsedSalary, status: "unpaid", dueDate: parseDateValue(dueDate) });
      }
      await employment.save();
    }

    await HiringDecision.updateMany({ user: req.user._id, helper: result.helper._id, status: { $ne: "closed" } }, { status: "hired" });
    await employment.populate(POPULATE_EMPLOYMENT);
    res.status(201).json({ success: true, data: employment });
  } catch (err) {
    console.error("hireHelper error:", err.message);
    res.status(500).json({ msg: "Failed to hire helper", error: err.message });
  }
};

const getOwnedEmployment = async (employmentId, userId) => {
  const employment = await Employment.findById(employmentId);
  if (!employment) return { error: { code: 404, msg: "Employment relationship not found" } };
  if (String(employment.user) !== String(userId)) return { error: { code: 403, msg: "You can only update your own active helpers" } };
  return { employment };
};

const addEmploymentAttendance = async (req, res) => {
  try {
    const result = await getOwnedEmployment(req.params.id, req.user._id);
    if (result.error) return res.status(result.error.code).json({ msg: result.error.msg });

    const date = trimText(req.body.date, 20);
    const status = trimText(req.body.status, 20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ msg: "Attendance date must be in YYYY-MM-DD format" });
    if (!["present", "absent"].includes(status)) return res.status(400).json({ msg: "Attendance status must be present or absent" });

    const existing = result.employment.attendance.find((item) => item.date === date);
    if (existing) {
      existing.status = status;
      existing.note = trimText(req.body.note, 300);
    } else {
      result.employment.attendance.push({ date, status, note: trimText(req.body.note, 300) });
    }
    result.employment.attendance.sort((a, b) => String(b.date).localeCompare(String(a.date)));

    await result.employment.save();
    await result.employment.populate(POPULATE_EMPLOYMENT);
    res.status(201).json({ success: true, data: result.employment });
  } catch (err) {
    console.error("addEmploymentAttendance error:", err.message);
    res.status(500).json({ msg: "Failed to update employment attendance", error: err.message });
  }
};

const upsertSalaryStatus = async (req, res) => {
  try {
    const result = await getOwnedEmployment(req.params.id, req.user._id);
    if (result.error) return res.status(result.error.code).json({ msg: result.error.msg });

    const monthLabel = trimText(req.body.monthLabel, 60);
    const amount = Number(req.body.amount ?? result.employment.salary);
    const status = trimText(req.body.status, 20) || "unpaid";
    if (!monthLabel) return res.status(400).json({ msg: "Month label is required" });
    if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ msg: "Amount must be valid" });
    if (!["paid", "unpaid"].includes(status)) return res.status(400).json({ msg: "Salary status must be paid or unpaid" });

    const existing = result.employment.salaryTracker.find((item) => item.monthLabel.toLowerCase() === monthLabel.toLowerCase());
    const payload = {
      amount,
      status,
      dueDate: parseDateValue(req.body.dueDate),
      paidOn: status === "paid" ? parseDateValue(req.body.paidOn) || new Date() : null,
    };

    if (existing) Object.assign(existing, payload);
    else result.employment.salaryTracker.push({ monthLabel, ...payload });

    await result.employment.save();
    await result.employment.populate(POPULATE_EMPLOYMENT);
    res.status(200).json({ success: true, data: result.employment });
  } catch (err) {
    console.error("upsertSalaryStatus error:", err.message);
    res.status(500).json({ msg: "Failed to update salary tracker", error: err.message });
  }
};

const addEmploymentWeeklyReview = async (req, res) => {
  try {
    const result = await getOwnedEmployment(req.params.id, req.user._id);
    if (result.error) return res.status(result.error.code).json({ msg: result.error.msg });

    const weekLabel = trimText(req.body.weekLabel, 60);
    const scores = ["punctuality", "behavior", "workQuality", "consistency"].reduce((acc, key) => {
      acc[key] = Number(req.body[key]);
      return acc;
    }, {});

    if (!weekLabel) return res.status(400).json({ msg: "Week label is required" });
    if (Object.values(scores).some((value) => !Number.isFinite(value) || value < 1 || value > 5)) {
      return res.status(400).json({ msg: "Weekly review scores must be between 1 and 5" });
    }

    const existing = result.employment.weeklyReviews.find((item) => item.weekLabel.toLowerCase() === weekLabel.toLowerCase());
    if (existing) Object.assign(existing, scores, { notes: trimText(req.body.notes) });
    else result.employment.weeklyReviews.push({ weekLabel, ...scores, notes: trimText(req.body.notes) });

    await result.employment.save();
    await result.employment.populate(POPULATE_EMPLOYMENT);
    res.status(201).json({ success: true, data: result.employment });
  } catch (err) {
    console.error("addEmploymentWeeklyReview error:", err.message);
    res.status(500).json({ msg: "Failed to save employment review", error: err.message });
  }
};

const updatePrivateNotes = async (req, res) => {
  try {
    const result = await getOwnedEmployment(req.params.id, req.user._id);
    if (result.error) return res.status(result.error.code).json({ msg: result.error.msg });

    result.employment.privateNotes = trimText(req.body.privateNotes, 2000);
    await result.employment.save();
    await result.employment.populate(POPULATE_EMPLOYMENT);
    res.status(200).json({ success: true, data: result.employment });
  } catch (err) {
    console.error("updatePrivateNotes error:", err.message);
    res.status(500).json({ msg: "Failed to save private notes", error: err.message });
  }
};

module.exports = {
  getHiringDashboard,
  createPendingDecision,
  scheduleTrial,
  hireHelper,
  addEmploymentAttendance,
  upsertSalaryStatus,
  addEmploymentWeeklyReview,
  updatePrivateNotes,
};
