const express = require("express");

const {
  addTransaction,
  getAllTransactions,
  editTransaction,
  removeTransaction,
} = require("../controllers/transactionController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, addTransaction);
router.get("/", authenticate, getAllTransactions);
router.put("/:id", authenticate, editTransaction);
router.delete("/:id", authenticate, removeTransaction);

module.exports = router;
