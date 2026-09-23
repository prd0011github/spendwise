import {
  getBudget as getBudgetApi,
  updateBudget as updateBudgetApi,
} from "./api";

export const fetchBudget = async (token) => {
  const response = await getBudgetApi(token);

  return response.data;
};

export const saveBudget = async (token, budget) => {
  const response = await updateBudgetApi(token, budget);

  return response.data;
};
