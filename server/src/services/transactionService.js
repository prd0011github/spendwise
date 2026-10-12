const Transaction = require("../models/Transaction");

const createTransaction = async (userId, transactionData) => {
  const { timeZone = "UTC", ...transactionFields } = transactionData;

  // Validate the supplied time zone.
  let todayKey;

  try {
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const parts = Object.fromEntries(
      dateParts.map(({ type, value }) => [type, value]),
    );

    todayKey = `${parts.year}-${parts.month}-${parts.day}`;
  } catch {
    const error = new Error("Invalid time zone");
    error.statusCode = 400;
    throw error;
  }

  const transactionDate = String(transactionFields.date || "");

  // Validate YYYY-MM-DD format and actual calendar date.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
    const error = new Error("Invalid transaction date");
    error.statusCode = 400;
    throw error;
  }

  const parsedDate = new Date(`${transactionDate}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== transactionDate
  ) {
    const error = new Error("Invalid transaction date");
    error.statusCode = 400;
    throw error;
  }

  const currentMonthKey = todayKey.slice(0, 7);
  const transactionMonthKey = transactionDate.slice(0, 7);

  if (transactionMonthKey !== currentMonthKey) {
    const error = new Error(
      "Transactions can only be created for the current month",
    );
    error.statusCode = 400;
    throw error;
  }

  if (transactionDate > todayKey) {
    const error = new Error("Transaction date cannot be in the future");
    error.statusCode = 400;
    throw error;
  }

  return Transaction.create({
    ...transactionFields,
    userId,
  });
};

const getTransactions = async (userId) => {
  const transactions = await Transaction.find({ userId }).sort({
    date: -1,
  });

  return transactions;
};

const updateTransaction = async (userId, transactionId, transactionData) => {
  const existingTransaction = await Transaction.findOne({
    _id: transactionId,
    userId,
  });

  if (!existingTransaction) {
    return null;
  }

  const today = new Date();

  const currentMonthKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;

  const transactionMonthKey = String(existingTransaction.date).slice(0, 7);

  if (transactionMonthKey !== currentMonthKey) {
    const error = new Error("Historical transactions cannot be edited");

    error.statusCode = 400;

    throw error;
  }

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
  const existingTransaction = await Transaction.findOne({
    _id: transactionId,
    userId,
  });

  if (!existingTransaction) {
    return null;
  }

  const today = new Date();

  const currentMonthKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;

  const transactionMonthKey = String(existingTransaction.date).slice(0, 7);

  if (transactionMonthKey !== currentMonthKey) {
    const error = new Error("Historical transactions cannot be deleted");

    error.statusCode = 400;

    throw error;
  }

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
