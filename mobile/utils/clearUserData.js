import AsyncStorage from "@react-native-async-storage/async-storage";

export const clearUserData = async (userId) => {
  if (!userId) {
    return;
  }

  const allKeys = await AsyncStorage.getAllKeys();

  const escapedId = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const userKeyPattern = new RegExp(`_${escapedId}(?:_|$)`);

  const userKeys = allKeys.filter(
    (key) => key.startsWith("@spendwise_") && userKeyPattern.test(key),
  );

  if (userKeys.length === 0) {
    return;
  }

  await AsyncStorage.multiRemove(userKeys);
};
