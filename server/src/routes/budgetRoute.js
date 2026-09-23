const express = require("express");
const {
  getBudgetAmount,
  updateBudget,
} = require("../controllers/budgetController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getBudgetAmount);
router.put("/", authenticate, updateBudget);

module.exports = router;
