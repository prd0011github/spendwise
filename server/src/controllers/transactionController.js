const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../services/transactionService");

const addTransaction = async (req, res) => {
  try {
    const transaction = await createTransaction(req.userId, req.body);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction data",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await getTransactions(req.userId);

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};

const editTransaction = async (req, res) => {
  try {
    const transaction = await updateTransaction(
      req.userId,
      req.params.id,
      req.body,
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction data",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
};

const removeTransaction = async (req, res) => {
  try {
    const transaction = await deleteTransaction(req.userId, req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
  editTransaction,
  removeTransaction,
};
