import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "@spendwise_auth_token";
const AUTH_USER_KEY = "@spendwise_auth_user";

export const saveAuthToken = async (token) => {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = async () => {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
};

export const saveAuthUser = async (user) => {
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const getAuthUser = async () => {
  const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);

  return storedUser ? JSON.parse(storedUser) : null;
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  await AsyncStorage.removeItem(AUTH_USER_KEY);
};
