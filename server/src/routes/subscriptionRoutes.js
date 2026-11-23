const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const verifyGooglePubSub = require("../middleware/verifyGooglePubSub");

const {
  verifyGoogleSubscription,
} = require("../controllers/subscriptionController");

const { googleRtdnController } = require("../controllers/googleRtdnController");

const router = express.Router();

// Existing user-authenticated purchase verification.
router.post("/google/verify", authenticate, verifyGoogleSubscription);

// Google Pub/Sub authenticated RTDN endpoint.
router.post("/google/rtdn", verifyGooglePubSub, googleRtdnController);

module.exports = router;
