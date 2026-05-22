const Booking = require("../models/Booking");
const Helper = require("../models/Helper");

const ACTIVE_RELATION_STATUSES = ["pending", "accepted", "active"];
const POPULATE_BOOKING = [
  { path: "user", select: "name email role" },
  {
    path: "helper",
    select: "name service city area price rating verified livePhoto phone user",
    populate: { path: "user", select: "name email role" },
  },
  { path: "messages.sender", select: "name email role" },
];

const trimText = (value, max = 1200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const parseDateValue = (value) => {
  if (value == null || value === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const validatePhone = (value) => /^\d{10,15}$/.test(String(value || "").replace(/\s+/g, ""));

const populateBooking = (booking) => booking.populate(POPULATE_BOOKING);

const getParticipantBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return { error: { code: 404, msg: "Connection not found" } };
  }

  const helperProfile = await Helper.findById(booking.helper).select("user name");
  const isUser = String(booking.user) === String(userId);
  const isHelper = !!helperProfile && String(helperProfile.user) === String(userId);

  if (!isUser && !isHelper) {
    return { error: { code: 403, msg: "You can only access your own connections" } };
  }

  return { booking, helperProfile, isUser, isHelper };
};

const createBooking = async (req, res) => {
  try {
    const { helperId, message, startDate, monthlyBudget, contactNumber } = req.body;

    if (req.user.role !== "user") {
      return res.status(403).json({ msg: "Only household user accounts can contact helpers" });
    }

    if (!helperId) {
      return res.status(400).json({ msg: "helperId is required" });
    }

    const helper = await Helper.findById(helperId);
    if (!helper || helper.verificationStatus !== "approved") {
      return res.status(404).json({ msg: "Helper not found" });
    }

    if (helper.user && String(helper.user) === String(req.user._id)) {
      return res.status(400).json({ msg: "You cannot contact your own helper profile" });
    }

    const existing = await Booking.findOne({
      user: req.user._id,
      helper: helperId,
      status: { $in: ACTIVE_RELATION_STATUSES },
    });

    if (existing) {
      return res.status(400).json({ msg: "You already have an active conversation or service with this helper" });
    }

    const parsedStart = startDate != null && startDate !== "" ? parseDateValue(startDate) : null;
    if (startDate != null && startDate !== "" && !parsedStart) {
      return res.status(400).json({ msg: "Invalid preferred start date" });
    }

    let parsedBudget = null;
    if (monthlyBudget != null && monthlyBudget !== "") {
      parsedBudget = Number(monthlyBudget);
      if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
        return res.status(400).json({ msg: "Monthly budget must be a valid positive number" });
      }
    }

    const introMessage = trimText(message);
    const cleanContactNumber = trimText(contactNumber, 20);
    if (cleanContactNumber && !validatePhone(cleanContactNumber)) {
      return res.status(400).json({ msg: "Contact number must be 10 to 15 digits" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      helper: helperId,
      message: introMessage,
      startDate: parsedStart,
      monthlyBudget: parsedBudget,
      contactNumber: cleanContactNumber,
      messages: introMessage
        ? [
            {
              sender: req.user._id,
              senderRole: "user",
              text: introMessage,
            },
          ]
        : [],
    });

    await populateBooking(booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("createBooking error:", err.message);
    res.status(500).json({ msg: "Failed to create connection request", error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate(POPULATE_BOOKING)
      .sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getMyBookings error:", err.message);
    res.status(500).json({ msg: "Failed to fetch connections", error: err.message });
  }
};

const getHelperRequests = async (req, res) => {
  try {
    const helper = await Helper.findOne({ user: req.user._id });
    if (!helper) {
      return res.status(404).json({ msg: "Helper profile not found" });
    }

    const bookings = await Booking.find({ helper: helper._id })
      .populate(POPULATE_BOOKING)
      .sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getHelperRequests error:", err.message);
    res.status(500).json({ msg: "Failed to fetch helper requests", error: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["accepted", "rejected", "active", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const result = await getParticipantBooking(req.params.id, req.user._id);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { booking, isUser, isHelper } = result;

    if (isHelper && !["accepted", "rejected", "completed"].includes(status)) {
      return res.status(403).json({ msg: "Helpers can only accept, reject, or complete a connection" });
    }

    if (isUser && !["active", "completed", "cancelled"].includes(status)) {
      return res.status(403).json({ msg: "Users can only start, complete, or cancel a service" });
    }

    const currentStatus = booking.status;
    const validTransitions = {
      pending: ["accepted", "rejected", "cancelled"],
      accepted: ["active", "completed", "cancelled"],
      active: ["completed", "cancelled"],
      rejected: [],
      completed: [],
      cancelled: [],
    };

    if (!(validTransitions[currentStatus] || []).includes(status)) {
      return res.status(400).json({ msg: `Cannot move connection from ${currentStatus} to ${status}` });
    }

    booking.status = status;
    if (status === "active" && !booking.serviceStartedAt) {
      booking.serviceStartedAt = new Date();
    }

    await booking.save();
    await populateBooking(booking);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("updateBookingStatus error:", err.message);
    res.status(500).json({ msg: "Failed to update connection", error: err.message });
  }
};

const addMessage = async (req, res) => {
  try {
    const result = await getParticipantBooking(req.params.id, req.user._id);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { booking, isHelper } = result;
    if (!["pending", "accepted", "active"].includes(booking.status)) {
      return res.status(400).json({ msg: "Messages are only available for open connections" });
    }

    const text = trimText(req.body.text);
    if (!text) {
      return res.status(400).json({ msg: "Message text is required" });
    }

    booking.messages.push({
      sender: req.user._id,
      senderRole: isHelper ? "helper" : "user",
      text,
    });
    booking.updatedAt = new Date();

    await booking.save();
    await populateBooking(booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("addMessage error:", err.message);
    res.status(500).json({ msg: "Failed to send message", error: err.message });
  }
};

const createCallRequest = async (req, res) => {
  try {
    const result = await getParticipantBooking(req.params.id, req.user._id);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { booking, isHelper } = result;
    if (!["pending", "accepted", "active"].includes(booking.status)) {
      return res.status(400).json({ msg: "Calling is only available for open connections" });
    }

    const latestPending = [...booking.callRequests].reverse().find((item) => item.status === "pending");
    if (latestPending) {
      return res.status(400).json({ msg: "There is already a pending masked call request" });
    }

    booking.callRequests.push({
      requestedByRole: isHelper ? "helper" : "user",
      note: trimText(req.body.note, 400),
    });
    booking.updatedAt = new Date();

    await booking.save();
    await populateBooking(booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("createCallRequest error:", err.message);
    res.status(500).json({ msg: "Failed to request masked call", error: err.message });
  }
};

const updateCallRequest = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "declined", "completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid call request status" });
    }

    const result = await getParticipantBooking(req.params.id, req.user._id);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { booking, isHelper } = result;
    const callRequest = booking.callRequests.id(req.params.callId);
    if (!callRequest) {
      return res.status(404).json({ msg: "Call request not found" });
    }

    const actorRole = isHelper ? "helper" : "user";
    if (status !== "completed" && callRequest.requestedByRole === actorRole) {
      return res.status(403).json({ msg: "The other participant must respond to this call request" });
    }

    callRequest.status = status;
    callRequest.respondedAt = new Date();
    booking.updatedAt = new Date();

    await booking.save();
    await populateBooking(booking);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("updateCallRequest error:", err.message);
    res.status(500).json({ msg: "Failed to update call request", error: err.message });
  }
};

const addAttendance = async (req, res) => {
  try {
    const result = await getParticipantBooking(req.params.id, req.user._id);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { booking, isHelper } = result;
    if (!["accepted", "active", "completed"].includes(booking.status)) {
      return res.status(400).json({ msg: "Attendance is available after the helper is accepted" });
    }

    const date = trimText(req.body.date, 20);
    const status = trimText(req.body.status, 20) || "present";
    const note = trimText(req.body.note, 300);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ msg: "Attendance date must be in YYYY-MM-DD format" });
    }
    if (!["present", "absent", "leave"].includes(status)) {
      return res.status(400).json({ msg: "Invalid attendance status" });
    }

    const existing = booking.attendance.find((item) => item.date === date);
    if (existing) {
      existing.status = status;
      existing.note = note;
      existing.markedByRole = isHelper ? "helper" : "user";
    } else {
      booking.attendance.push({
        date,
        status,
        note,
        markedByRole: isHelper ? "helper" : "user",
      });
    }

    booking.attendance.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    booking.updatedAt = new Date();

    await booking.save();
    await populateBooking(booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("addAttendance error:", err.message);
    res.status(500).json({ msg: "Failed to update attendance", error: err.message });
  }
};

const addPayment = async (req, res) => {
  try {
    const result = await getParticipantBooking(req.params.id, req.user._id);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { booking, isUser } = result;
    if (!isUser) {
      return res.status(403).json({ msg: "Only the household can log monthly payments" });
    }
    if (!["accepted", "active", "completed"].includes(booking.status)) {
      return res.status(400).json({ msg: "Payments are available after the helper is accepted" });
    }

    const monthLabel = trimText(req.body.monthLabel, 60);
    const note = trimText(req.body.note, 300);
    const amount = Number(req.body.amount);
    const paidOn = parseDateValue(req.body.paidOn) || new Date();

    if (!monthLabel) {
      return res.status(400).json({ msg: "Month label is required" });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ msg: "Payment amount must be a valid positive number" });
    }

    const existing = booking.payments.find((item) => item.monthLabel.toLowerCase() === monthLabel.toLowerCase());
    if (existing) {
      existing.amount = amount;
      existing.status = "paid";
      existing.note = note;
      existing.paidOn = paidOn;
    } else {
      booking.payments.push({
        monthLabel,
        amount,
        status: "paid",
        note,
        paidOn,
      });
    }

    booking.payments.sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));
    booking.updatedAt = new Date();

    await booking.save();
    await populateBooking(booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("addPayment error:", err.message);
    res.status(500).json({ msg: "Failed to log payment", error: err.message });
  }
};

const addWeeklyReview = async (req, res) => {
  try {
    const result = await getParticipantBooking(req.params.id, req.user._id);
    if (result.error) {
      return res.status(result.error.code).json({ msg: result.error.msg });
    }

    const { booking, isUser } = result;
    if (!isUser) {
      return res.status(403).json({ msg: "Only the household can submit weekly reviews" });
    }
    if (!["active", "completed"].includes(booking.status)) {
      return res.status(400).json({ msg: "Weekly reviews are available after service starts" });
    }

    const weekLabel = trimText(req.body.weekLabel, 60);
    const review = trimText(req.body.review);
    const rating = Number(req.body.rating);
    const recommended = req.body.recommended === true || req.body.recommended === "true";

    if (!weekLabel) {
      return res.status(400).json({ msg: "Week label is required" });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Weekly rating must be between 1 and 5" });
    }

    const existing = booking.weeklyReviews.find((item) => item.weekLabel.toLowerCase() === weekLabel.toLowerCase());
    if (existing) {
      existing.rating = rating;
      existing.review = review;
      existing.recommended = recommended;
    } else {
      booking.weeklyReviews.push({
        weekLabel,
        rating,
        review,
        recommended,
      });
    }

    booking.weeklyReviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    booking.updatedAt = new Date();

    await booking.save();
    await populateBooking(booking);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("addWeeklyReview error:", err.message);
    res.status(500).json({ msg: "Failed to save weekly review", error: err.message });
  }
};

module.exports = {
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
};
