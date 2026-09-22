import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "./api";

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
