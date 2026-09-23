import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "./api";

import AsyncStorage from "@react-native-async-storage/async-storage";

const normalizeTransaction = (transaction) => ({
  ...transaction,
  id: transaction._id || transaction.id,
});

export const fetchTransactions = async (token) => {
  const response = await getTransactions(token);

  return response.data.map(normalizeTransaction);
};

export const addTransaction = async (token, transactionData) => {
  const response = await createTransaction(token, transactionData);

  return normalizeTransaction(response.data);
};

export const editTransaction = async (
  token,
  transactionId,
  transactionData,
) => {
  const response = await updateTransaction(
    token,
    transactionId,
    transactionData,
  );

  return normalizeTransaction(response.data);
};

export const removeTransaction = async (token, transactionId) => {
  await deleteTransaction(token, transactionId);
};

const getTransactionsCacheKey = (userId) => `@spendwise_transactions_${userId}`;

const getPendingTransactionsKey = (userId) =>
  `@spendwise_pending_transactions_${userId}`;

export const getCachedTransactions = async (userId) => {
  if (!userId) {
    return [];
  }

  const cacheKey = getTransactionsCacheKey(userId);

  const storedTransactions = await AsyncStorage.getItem(cacheKey);

  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

export const cacheTransactions = async (userId, transactions) => {
  if (!userId) {
    return;
  }

  const cacheKey = getTransactionsCacheKey(userId);

  await AsyncStorage.setItem(cacheKey, JSON.stringify(transactions));
};

export const getPendingTransactions = async (userId) => {
  if (!userId) {
    return [];
  }

  const pendingKey = getPendingTransactionsKey(userId);

  const storedTransactions = await AsyncStorage.getItem(pendingKey);

  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

export const savePendingTransactions = async (userId, transactions) => {
  if (!userId) {
    return;
  }

  const pendingKey = getPendingTransactionsKey(userId);

  await AsyncStorage.setItem(pendingKey, JSON.stringify(transactions));
};

// Flag to prevent multiple syncs at the same time

let isSyncingPendingTransactions = false;

export const syncPendingTransactions = async (userId, token) => {
  if (!userId || !token) {
    return [];
  }

  if (isSyncingPendingTransactions) {
    console.log("Transaction sync already in progress");
    return [];
  }

  isSyncingPendingTransactions = true;

  try {
    const pendingTransactions = await getPendingTransactions(userId);

    if (pendingTransactions.length === 0) {
      return [];
    }

    const syncedTransactions = [];
    const remainingTransactions = [];

    for (const transaction of pendingTransactions) {
      try {
        const serverTransaction = await addTransaction(token, {
          name: transaction.name,
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
        });

        syncedTransactions.push({
          localId: transaction.id,
          transaction: serverTransaction,
        });
      } catch (error) {
        console.log(
          `Failed to sync transaction ${transaction.id}:`,
          error.message,
        );

        remainingTransactions.push(transaction);
      }
    }

    await savePendingTransactions(userId, remainingTransactions);

    return syncedTransactions;
  } finally {
    isSyncingPendingTransactions = false;
  }
};
