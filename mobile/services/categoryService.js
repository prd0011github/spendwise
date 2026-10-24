import AsyncStorage from "@react-native-async-storage/async-storage";

const getStorageKey = (userId) => `@spendwise_custom_categories_${userId}`;

export const getCustomCategories = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const storedCategories = await AsyncStorage.getItem(getStorageKey(userId));

    if (!storedCategories) {
      return [];
    }

    const parsedCategories = JSON.parse(storedCategories);

    return Array.isArray(parsedCategories) ? parsedCategories : [];
  } catch (error) {
    console.log("Failed to load custom categories:", error.message);
    return [];
  }
};

export const saveCustomCategories = async (userId, categories) => {
  if (!userId) {
    throw new Error("User ID is required to save categories.");
  }

  if (!Array.isArray(categories)) {
    throw new Error("Categories must be an array.");
  }

  await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(categories));
};
