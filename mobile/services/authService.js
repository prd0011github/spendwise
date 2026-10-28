import {
  loginUser,
  registerUser,
  getCurrentUser,
  requestPasswordReset as requestPasswordResetAPI,
  resetPassword as resetPasswordAPI,
} from "./api";

import {
  saveAuthToken,
  getAuthToken,
  saveAuthUser,
  getAuthUser,
  removeAuthToken,
} from "./authStorage";

export const login = async (email, password) => {
  const response = await loginUser(email, password);

  await saveAuthToken(response.data.token);

  // Fetch the latest user profile, including the current Pro entitlement.
  const currentUserResponse = await getCurrentUser(response.data.token);
  const currentUser = currentUserResponse.data;

  await saveAuthUser(currentUser);

  return {
    ...response.data,
    user: currentUser,
  };
};

export const register = async (name, email, password) => {
  return registerUser(name, email, password);
};

export const requestPasswordReset = async (email) => {
  return requestPasswordResetAPI(email);
};

export const resetPassword = async (token, newPassword) => {
  return resetPasswordAPI(token, newPassword);
};

export const restoreSession = async () => {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await getCurrentUser(token);

    await saveAuthUser(response.data);

    return {
      token,
      user: response.data,
    };
  } catch (error) {
    if (error.message === "Invalid or expired authentication token") {
      await removeAuthToken();
      return null;
    }

    const storedUser = await getAuthUser();

    if (!storedUser) {
      return null;
    }

    return {
      token,
      user: storedUser,
    };
  }
};

export const refreshCurrentUser = async () => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Please log in again to continue.");
  }

  const response = await getCurrentUser(token);
  await saveAuthUser(response.data);

  return response.data;
};

export const logout = async () => {
  await removeAuthToken();
};
