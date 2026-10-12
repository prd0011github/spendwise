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

const getPendingTransactionsKey = (userId) =>
  `@spendwise_pending_transactions_${userId}`;

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
        if (transaction.syncAction === "delete") {
          try {
            await deleteTransaction(token, transaction.transactionId);
          } catch (error) {
            if (
              error.message?.toLowerCase().includes("transaction not found")
            ) {
              console.log(
                "Transaction already deleted:",
                transaction.transactionId,
              );
            } else {
              throw error;
            }
          }

          syncedTransactions.push({
            localId: transaction.transactionId,
            transaction: null,
            syncAction: "delete",
          });
        } else if (transaction.syncAction === "update") {
          const serverTransaction = await editTransaction(
            token,
            transaction.transactionId,
            {
              name: transaction.name,
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date,
            },
          );

          syncedTransactions.push({
            localId: transaction.transactionId,
            transaction: serverTransaction,
            syncAction: "update",
          });
        } else if (transaction.syncAction === "create") {
          const serverTransaction = await addTransaction(token, {
            name: transaction.name,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
            timeZone:
              transaction.timeZone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone,
          });

          syncedTransactions.push({
            localId: transaction.id,
            transaction: serverTransaction,
            syncAction: "create",
          });
        }
      } catch (error) {
        console.log(
          `Failed to sync transaction ${transaction.id}:`,
          error.message,
        );

        // Keep operations that may succeed on a later attempt.
        // Do not retry permanent client-side failures indefinitely.
        const statusCode = error.statusCode;

        if (statusCode === 400 || statusCode === 403 || statusCode === 404) {
          console.warn("Removing permanently rejected pending operation:", {
            id: transaction.id,
            action: transaction.syncAction,
            statusCode,
            message: error.message,
          });
          continue;
        }

        // Network errors, authentication errors, and server errors
        // remain pending for a future retry.
        remainingTransactions.push(transaction);
      }
    }

    await savePendingTransactions(userId, remainingTransactions);

    return syncedTransactions;
  } finally {
    isSyncingPendingTransactions = false;
  }
};

export const addPendingTransactionUpdate = async (
  userId,
  transactionId,
  transactionData,
) => {
  if (!userId || !transactionId) {
    return;
  }

  const pendingTransactions = await getPendingTransactions(userId);

  // --------------------------------------------------
  // Offline-created transaction
  // --------------------------------------------------
  // A local_* transaction does not have a MongoDB ID yet.
  // Therefore it must remain a CREATE operation.
  if (transactionId.startsWith("local_")) {
    const pendingCreateIndex = pendingTransactions.findIndex(
      (transaction) =>
        transaction.syncAction === "create" && transaction.id === transactionId,
    );

    if (pendingCreateIndex !== -1) {
      // Update the existing pending CREATE
      const updatedPendingTransactions = [...pendingTransactions];

      updatedPendingTransactions[pendingCreateIndex] = {
        ...updatedPendingTransactions[pendingCreateIndex],
        ...transactionData,
        syncAction: "create",
      };

      await savePendingTransactions(userId, updatedPendingTransactions);

      console.log("Updated existing pending CREATE:", transactionId);

      return;
    }

    // The CREATE is not in the queue yet.
    // Create it now instead of creating an UPDATE.
    const pendingCreate = {
      id: transactionId,
      ...transactionData,
      syncAction: "create",
      isPendingSync: true,
    };

    await savePendingTransactions(userId, [
      ...pendingTransactions,
      pendingCreate,
    ]);

    console.log("Created pending CREATE for local transaction:", transactionId);

    return;
  }

  // --------------------------------------------------
  // Existing server transaction
  // --------------------------------------------------

  const updatedPendingTransactions = pendingTransactions.filter(
    (transaction) =>
      !(
        transaction.syncAction === "update" &&
        transaction.transactionId === transactionId
      ),
  );

  updatedPendingTransactions.push({
    id: `pending_update_${transactionId}`,
    transactionId,
    ...transactionData,
    syncAction: "update",
  });

  await savePendingTransactions(userId, updatedPendingTransactions);
};

export const addPendingTransactionDelete = async (userId, transactionId) => {
  if (!userId || !transactionId) return;

  const pendingTransactions = await getPendingTransactions(userId);

  // Offline-created transaction:
  // It does not exist on the server yet,
  // so deleting it means removing the pending CREATE.
  if (transactionId.startsWith("local_")) {
    const updatedPendingTransactions = pendingTransactions.filter(
      (transaction) =>
        !(
          transaction.syncAction === "create" &&
          transaction.id === transactionId
        ),
    );

    await savePendingTransactions(userId, updatedPendingTransactions);

    console.log(
      "Removed pending CREATE for deleted local transaction:",
      transactionId,
    );

    return;
  }

  // Existing server transaction:
  // Queue DELETE for synchronization.
  const updatedPendingTransactions = pendingTransactions.filter(
    (transaction) =>
      !(
        transaction.syncAction === "delete" &&
        transaction.transactionId === transactionId
      ),
  );

  updatedPendingTransactions.push({
    id: `pending_delete_${transactionId}`,
    transactionId,
    syncAction: "delete",
  });

  await savePendingTransactions(userId, updatedPendingTransactions);

  console.log("Added pending DELETE:", transactionId);
};
