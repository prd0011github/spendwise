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
  const token = response.data.token;

  try {
    // Verify the token and fetch the latest user profile.
    const currentUserResponse = await getCurrentUser(token);
    const currentUser = currentUserResponse.data;

    // Save the session only after successful verification.
    await saveAuthToken(token);
    await saveAuthUser(currentUser);

    return {
      ...response.data,
      user: currentUser,
    };
  } catch (error) {
    // Remove any partially saved authentication data.
    await removeAuthToken();
    throw error;
  }
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
    const isAuthError =
      error.statusCode === 401 ||
      error.statusCode === 403 ||
      error.statusCode === 404 ||
      error.message === "Invalid or expired authentication token" ||
      error.message === "Session expired. Please log in again.";

    if (isAuthError) {
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

  try {
    const response = await getCurrentUser(token);
    await saveAuthUser(response.data);

    return response.data;
  } catch (error) {
    if (
      error.statusCode === 401 ||
      error.statusCode === 403 ||
      error.statusCode === 404
    ) {
      await removeAuthToken();
    }

    throw error;
  }
};

export const logout = async () => {
  await removeAuthToken();
};
