import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "@spendwise_auth_token";

export const saveAuthToken = async (token) => {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = async () => {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
};
