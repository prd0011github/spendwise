import { loginUser, registerUser, getCurrentUser } from "./api";

import { saveAuthToken, getAuthToken, removeAuthToken } from "./authStorage";

export const login = async (email, password) => {
  const response = await loginUser(email, password);

  await saveAuthToken(response.data.token);

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

    return {
      token,
      user: response.data,
    };
  } catch (error) {
    await removeAuthToken();
    return null;
  }
};

export const logout = async () => {
  await removeAuthToken();
};
