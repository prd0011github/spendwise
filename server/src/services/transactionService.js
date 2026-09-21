const Transaction = require("../models/Transaction");

const createTransaction = async (userId, transactionData) => {
  const transaction = await Transaction.create({
    ...transactionData,
    userId,
  });

  return transaction;
};

const getTransactions = async (userId) => {
  const transactions = await Transaction.find({ userId }).sort({
    date: -1,
  });

  return transactions;
};

const updateTransaction = async (userId, transactionId, transactionData) => {
  const transaction = await Transaction.findOneAndUpdate(
    {
      _id: transactionId,
      userId,
    },
    transactionData,
    {
      new: true,
      runValidators: true,
    },
  );

  return transaction;
};

const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId,
  });

  return transaction;
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
