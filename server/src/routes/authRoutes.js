const express = require("express");

const {
  register,
  login,
  getMe,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getMe);

router.put("/change-password", authenticate, changePassword);

router.delete("/account", authenticate, deleteAccount);

module.exports = router;
