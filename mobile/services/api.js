const API_BASE_URL = "http://192.168.1.101:5000/api";

const apiRequest = async (endpoint, options = {}) => {
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

export const checkHealth = async () => {
  return apiRequest("/health");
};
