import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getBudget as getBudgetApi,
  updateBudget as updateBudgetApi,
} from "./api";

const getBudgetCacheKey = (userId, month) =>
  `@spendwise_budget_${userId}_${month}`;

const getPendingBudgetCacheKey = (userId, month) =>
  `@spendwise_pending_budget_${userId}_${month}`;

// -------------------------
// Server
// -------------------------

export const fetchBudget = async (token, month) => {
  return getBudgetApi(token, month);
};

export const saveBudget = async (token, month, budget) => {
  return updateBudgetApi(token, month, budget);
};

// -------------------------
// Local cache
// -------------------------

export const cacheBudget = async (userId, month, budget) => {
  if (!userId || !month) {
    return;
  }

  const key = getBudgetCacheKey(userId, month);

  await AsyncStorage.setItem(key, String(budget));
};

export const getCachedBudget = async (userId, month) => {
  if (!userId || !month) {
    return null;
  }

  const key = getBudgetCacheKey(userId, month);

  const cachedBudget = await AsyncStorage.getItem(key);

  return cachedBudget !== null ? Number(cachedBudget) : null;
};

// -------------------------
// Pending budget sync
// -------------------------

export const savePendingBudget = async (userId, month, budget) => {
  if (!userId || !month) {
    return;
  }

  const key = getPendingBudgetCacheKey(userId, month);

  await AsyncStorage.setItem(key, String(budget));
};

export const getPendingBudget = async (userId, month) => {
  if (!userId || !month) {
    return null;
  }

  const key = getPendingBudgetCacheKey(userId, month);

  const pendingBudget = await AsyncStorage.getItem(key);

  return pendingBudget !== null ? Number(pendingBudget) : null;
};

export const clearPendingBudget = async (userId, month) => {
  if (!userId || !month) {
    return;
  }

  const key = getPendingBudgetCacheKey(userId, month);

  await AsyncStorage.removeItem(key);
};

// -------------------------
// Sync pending budget
// -------------------------

export const syncPendingBudget = async (token, userId, month) => {
  const pendingBudget = await getPendingBudget(userId, month);

  if (pendingBudget === null) {
    return null;
  }

  const budgetData = await saveBudget(token, month, pendingBudget);

  await cacheBudget(userId, month, Number(budgetData.budget.budget));

  await clearPendingBudget(userId, month);

  return budgetData;
};
