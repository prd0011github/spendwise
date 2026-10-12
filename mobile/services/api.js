const API_BASE_URL = "https://spendwise-5jkm.onrender.com/api";

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("API returned a non-JSON response:", {
        endpoint,
        status: response.status,
        contentType: response.headers.get("content-type"),
        responsePreview: responseText.slice(0, 300),
      });

      throw new Error(
        `Invalid API response (HTTP ${response.status}). Check the API URL and server logs.`,
      );
    }
  }

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed (HTTP ${response.status})`,
    );

    error.statusCode = response.status;
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
