const twilio = require("twilio");
const Booking = require("../models/Booking");
const Helper = require("../models/Helper");
const User = require("../models/User");

const { AccessToken } = twilio.jwt;
const VoiceGrant = AccessToken.VoiceGrant;
const { VoiceResponse } = twilio.twiml;

const getMissingVoiceConfig = () => {
  const required = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_API_KEY",
    "TWILIO_API_SECRET",
    "TWILIO_TWIML_APP_SID",
    "TWILIO_CALLER_ID",
  ];

  return required.filter((key) => !process.env[key]);
};

const ensureVoiceConfigured = (res) => {
  const missing = getMissingVoiceConfig();
  if (missing.length) {
    res.status(500).json({
      msg: `Twilio voice is not configured. Missing: ${missing.join(", ")}`,
    });
    return false;
  }
  return true;
};

const parseClientIdentityUserId = (fromValue = "") => {
  const match = String(fromValue).match(/^client:user-(.+)$/);
  return match?.[1] || null;
};

const normalizePhoneForTwilio = (value = "") => {
  const digits = String(value).replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return null;
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getVoiceToken = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ msg: "Only household users can place browser calls" });
    }

    if (!ensureVoiceConfigured(res)) return;

    const identity = `user-${req.user._id}`;
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity, ttl: 60 * 60 }
    );

    token.addGrant(
      new VoiceGrant({
        outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
        incomingAllow: false,
      })
    );

    res.status(200).json({
      success: true,
      token: token.toJwt(),
      identity,
    });
  } catch (err) {
    console.error("getVoiceToken error:", err.message);
    res.status(500).json({ msg: "Failed to create browser calling token", error: err.message });
  }
};

const upsertCallBooking = async ({ userId, helperId, message, startDate, monthlyBudget }) => {
  const existing = await Booking.findOne({
    user: userId,
    helper: helperId,
    status: { $in: ["pending", "accepted", "active"] },
  }).sort({ updatedAt: -1, createdAt: -1 });

  if (existing) {
    if (message && !existing.message) existing.message = message;
    if (startDate && !existing.startDate) existing.startDate = startDate;
    if (monthlyBudget != null && existing.monthlyBudget == null) existing.monthlyBudget = monthlyBudget;
    existing.updatedAt = new Date();
    await existing.save();
    return existing;
  }

  return Booking.create({
    user: userId,
    helper: helperId,
    status: "accepted",
    message: message || "Browser call started via GharSeva.",
    startDate,
    monthlyBudget,
    contactNumber: "twilio-browser-call",
    messages: message
      ? [
          {
            sender: userId,
            senderRole: "user",
            text: message,
          },
        ]
      : [],
  });
};

const handleBrowserOutboundCall = async (req, res) => {
  const response = new VoiceResponse();

  try {
    if (!getMissingVoiceConfig().length) {
      const userId = parseClientIdentityUserId(req.body.From || req.body.Caller || "");
      const helperId = String(req.body.helperId || "").trim();
      const helper = helperId ? await Helper.findById(helperId) : null;

      if (!userId) {
        response.say("We could not verify the caller identity for this browser call.");
        return res.type("text/xml").send(response.toString());
      }

      const user = await User.findById(userId).select("role name email");
      if (!user || user.role !== "user") {
        response.say("Only household user accounts can place browser calls.");
        return res.type("text/xml").send(response.toString());
      }

      if (!helper || helper.verificationStatus !== "approved") {
        response.say("This helper is not available for calls right now.");
        return res.type("text/xml").send(response.toString());
      }

      const dialTarget = normalizePhoneForTwilio(helper.phone);
      if (!dialTarget) {
        response.say("This helper does not have a callable phone number yet.");
        return res.type("text/xml").send(response.toString());
      }

      const monthlyBudget = req.body.monthlyBudget ? Number(req.body.monthlyBudget) : null;
      await upsertCallBooking({
        userId: user._id,
        helperId: helper._id,
        message: typeof req.body.message === "string" ? req.body.message.trim() : "",
        startDate: parseDateValue(req.body.startDate),
        monthlyBudget: Number.isFinite(monthlyBudget) ? monthlyBudget : null,
      });

      const dial = response.dial({
        callerId: process.env.TWILIO_CALLER_ID,
        answerOnBridge: true,
      });
      dial.number(dialTarget);
      return res.type("text/xml").send(response.toString());
    }

    response.say("Browser calling is not configured yet.");
    return res.type("text/xml").send(response.toString());
  } catch (err) {
    console.error("handleBrowserOutboundCall error:", err.message);
    response.say("We could not complete the call right now. Please try again later.");
    return res.type("text/xml").send(response.toString());
  }
};

module.exports = {
  getVoiceToken,
  handleBrowserOutboundCall,
};
