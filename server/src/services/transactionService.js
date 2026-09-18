const Transaction = require("../models/Transaction");

const createTransaction = async (transactionData) => {
  const transaction = await Transaction.create(transactionData);

  return transaction;
};

const getTransactions = async () => {
  const transactions = await Transaction.find().sort({ date: -1 });

  return transactions;
};

const updateTransaction = async (transactionId, transactionData) => {
  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    transactionData,
    {
      new: true,
      runValidators: true,
    },
  );

  return transaction;
};

const deleteTransaction = async (transactionId) => {
  const transaction = await Transaction.findByIdAndDelete(transactionId);

  return transaction;
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
