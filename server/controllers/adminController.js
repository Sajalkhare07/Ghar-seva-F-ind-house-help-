const Helper = require("../models/Helper");
const Booking = require("../models/Booking");
const User = require("../models/User");

const getOverview = async (req, res) => {
  try {
    const [users, helpers] = await Promise.all([
      User.find({}, "-password").sort({ createdAt: -1 }),
      Helper.find()
        .populate("user", "name email role")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 }),
    ]);

    const counts = {
      totalUsers: users.length,
      totalHelpers: helpers.length,
      pendingHelpers: helpers.filter((helper) => helper.verificationStatus === "pending").length,
      approvedHelpers: helpers.filter((helper) => helper.verificationStatus === "approved").length,
      rejectedHelpers: helpers.filter((helper) => helper.verificationStatus === "rejected").length,
    };

    res.status(200).json({
      success: true,
      counts,
      users,
      helpers,
    });
  } catch (err) {
    console.error("getOverview error:", err.message);
    res.status(500).json({ msg: "Failed to load admin overview", error: err.message });
  }
};

const reviewHelper = async (req, res) => {
  try {
    const { status, approvalNotes } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid review status" });
    }

    const trimmedNotes = typeof approvalNotes === "string" ? approvalNotes.trim() : "";

    if (status === "rejected") {
      const helper = await Helper.findById(req.params.id).populate("user", "name email role");

      if (!helper) {
        return res.status(404).json({ msg: "Helper not found" });
      }

      await Promise.all([
        Booking.deleteMany({ helper: helper._id }),
        User.updateMany({ savedHelpers: helper._id }, { $pull: { savedHelpers: helper._id } }),
        Helper.findByIdAndDelete(helper._id),
      ]);

      return res.status(200).json({
        success: true,
        removedId: String(helper._id),
        data: {
          _id: helper._id,
          name: helper.name,
          user: helper.user,
          approvalNotes: trimmedNotes,
        },
        msg: "Helper rejected and removed successfully",
      });
    }

    const updates = {
      verificationStatus: status,
      verified: status === "approved",
      approvalNotes: trimmedNotes,
      approvedAt: status === "approved" ? new Date() : null,
      approvedBy: status === "approved" ? req.user._id : null,
    };

    const helper = await Helper.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    })
      .populate("user", "name email role")
      .populate("approvedBy", "name email");

    if (!helper) {
      return res.status(404).json({ msg: "Helper not found" });
    }

    res.status(200).json({
      success: true,
      data: helper,
      msg: status === "approved" ? "Helper approved successfully" : "Helper moved back to pending review",
    });
  } catch (err) {
    console.error("reviewHelper error:", err.message);
    res.status(500).json({ msg: "Failed to review helper", error: err.message });
  }
};

module.exports = {
  getOverview,
  reviewHelper,
};