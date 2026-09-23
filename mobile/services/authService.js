import { loginUser, registerUser, getCurrentUser } from "./api";

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
  await saveAuthUser(response.data.user);

  return response.data;
};

export const register = async (name, email, password) => {
  return registerUser(name, email, password);
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

export const logout = async () => {
  await removeAuthToken();
};
