import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getBudget as getBudgetApi,
  updateBudget as updateBudgetApi,
} from "./api";

const getBudgetCacheKey = (userId) => `@spendwise_budget_${userId}`;

const getPendingBudgetKey = (userId) => `@spendwise_pending_budget_${userId}`;

// -------------------------
// Server
// -------------------------

export const fetchBudget = async (token) => {
  const response = await getBudgetApi(token);

  return response.data;
};

export const saveBudget = async (token, budget) => {
  const response = await updateBudgetApi(token, budget);

  return response.data;
};

// -------------------------
// Local cache
// -------------------------

export const cacheBudget = async (userId, budget) => {
  if (!userId) return;

  await AsyncStorage.setItem(getBudgetCacheKey(userId), String(budget));
};

export const getCachedBudget = async (userId) => {
  if (!userId) return null;

  const cachedBudget = await AsyncStorage.getItem(getBudgetCacheKey(userId));

  return cachedBudget !== null ? Number(cachedBudget) : null;
};

// -------------------------
// Pending budget sync
// -------------------------

export const savePendingBudget = async (userId, budget) => {
  if (!userId) return;

  await AsyncStorage.setItem(getPendingBudgetKey(userId), String(budget));
};

export const getPendingBudget = async (userId) => {
  if (!userId) return null;

  const pendingBudget = await AsyncStorage.getItem(getPendingBudgetKey(userId));

  return pendingBudget !== null ? Number(pendingBudget) : null;
};

export const clearPendingBudget = async (userId) => {
  if (!userId) return;

  await AsyncStorage.removeItem(getPendingBudgetKey(userId));
};

// -------------------------
// Sync pending budget
// -------------------------

export const syncPendingBudget = async (userId, token) => {
  if (!userId || !token) {
    return null;
  }

  const pendingBudget = await getPendingBudget(userId);

  if (pendingBudget === null) {
    return null;
  }

  try {
    const budgetData = await saveBudget(token, pendingBudget);

    const updatedBudget = Number(budgetData.budget);

    await cacheBudget(userId, updatedBudget);

    await clearPendingBudget(userId);

    return updatedBudget;
  } catch (error) {
    console.log("Budget sync pending:", error.message);

    return null;
  }
};
