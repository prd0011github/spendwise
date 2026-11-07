const express = require("express");

const {
  register,
  login,
  getMe,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const authenticate = require("../middleware/authMiddleware");

const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Public authentication routes
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

// Public password recovery routes
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

// Authenticated routes
router.get("/me", authenticate, getMe);
router.put("/change-password", authenticate, changePassword);
router.delete("/account", authenticate, deleteAccount);

module.exports = router;
