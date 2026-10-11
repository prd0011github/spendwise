const API_BASE_URL = "http://192.168.1.100:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");

    error.errors = data.errors || [];

    throw error;
  }

  return data;
};

export const loginUser = async (email, password) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const requestPasswordReset = async (email) => {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
};

export const resetPassword = async (token, newPassword) => {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token,
      newPassword,
    }),
  });
};

export const registerUser = async (name, email, password) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

export const getCurrentUser = async (token) => {
  return apiRequest("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changePassword = async (token, currentPassword, newPassword) => {
  return apiRequest("/auth/change-password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
};

export const deleteAccount = async (token) => {
  return apiRequest("/auth/account", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTransactions = async (token) => {
  return apiRequest("/transactions", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createTransaction = async (token, transactionData) => {
  return apiRequest("/transactions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(transactionData),
  });
};

export const updateTransaction = async (
  token,
  transactionId,
  transactionData,
) => {
  return apiRequest(`/transactions/${transactionId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(transactionData),
  });
};

export const deleteTransaction = async (token, transactionId) => {
  return apiRequest(`/transactions/${transactionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getBudget = async (token, month) => {
  return apiRequest(`/budget?month=${encodeURIComponent(month)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateBudget = async (token, month, budget) => {
  return apiRequest("/budget", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      month,
      budget,
    }),
  });
};

export const checkHealth = async () => {
  return apiRequest("/health");
};
