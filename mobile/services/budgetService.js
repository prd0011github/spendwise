import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getBudget as getBudgetApi,
  updateBudget as updateBudgetApi,
} from "./api";

const getBudgetCacheKey = (userId) => `@spendwise_budget_${userId}`;

export const fetchBudget = async (token) => {
  const response = await getBudgetApi(token);

  return response.data;
};

export const saveBudget = async (token, budget) => {
  const response = await updateBudgetApi(token, budget);

  return response.data;
};

export const cacheBudget = async (userId, budget) => {
  if (!userId) {
    return;
  }

  await AsyncStorage.setItem(getBudgetCacheKey(userId), String(budget));
};

export const getCachedBudget = async (userId) => {
  if (!userId) {
    return null;
  }

  const cachedBudget = await AsyncStorage.getItem(getBudgetCacheKey(userId));

  return cachedBudget !== null ? Number(cachedBudget) : null;
};
