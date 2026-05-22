const express = require("express");
const router = express.Router();

const { getVoiceToken, handleBrowserOutboundCall } = require("../controllers/callController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.get("/token", protect, restrictTo("user"), getVoiceToken);
router.post("/outbound", handleBrowserOutboundCall);

module.exports = router;
