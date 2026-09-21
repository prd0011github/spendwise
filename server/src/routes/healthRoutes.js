const express = require("express");

const { getHealth } = require("../controllers/healthController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getHealth);

router.get("/protected", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated",
    userId: req.userId,
  });
});

module.exports = router;
