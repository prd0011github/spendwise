import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearUserData = async (userId) => {
  if (!userId) {
    return;
  }

  const allKeys = await AsyncStorage.getAllKeys();

  const userKeys = allKeys.filter(
    (key) => key.startsWith("@spendwise_") && key.includes(`_${userId}`),
  );

  if (userKeys.length === 0) {
    return;
  }

  await AsyncStorage.multiRemove(userKeys);
};
