const Helper = require("../models/Helper");
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

    const updates = {
      verificationStatus: status,
      verified: status === "approved",
      approvalNotes: typeof approvalNotes === "string" ? approvalNotes.trim() : "",
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
      msg:
        status === "approved"
          ? "Helper approved successfully"
          : status === "rejected"
            ? "Helper rejected successfully"
            : "Helper moved back to pending review",
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
