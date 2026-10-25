const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const {
  verifyGoogleSubscription,
} = require("../controllers/subscriptionController");

const router = express.Router();

router.post("/google/verify", authenticate, verifyGoogleSubscription);

module.exports = router;
