const express = require("express");

const {
  getBudgetForMonth,
  saveBudgetForMonth,
} = require("../controllers/budgetController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getBudgetForMonth);

router.put("/", authenticate, saveBudgetForMonth);

module.exports = router;
