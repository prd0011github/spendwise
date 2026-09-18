const express = require("express");

const {
  addTransaction,
  getAllTransactions,
  editTransaction,
  removeTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/", addTransaction);
router.get("/", getAllTransactions);
router.put("/:id", editTransaction);
router.delete("/:id", removeTransaction);

module.exports = router;
