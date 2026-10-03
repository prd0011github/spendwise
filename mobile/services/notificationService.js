import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_REMINDER_HOUR = 20;
const DAILY_REMINDER_MINUTE = 0;

const BUDGET_WARNING_THRESHOLD = 0.8;

const getBudgetWarningId = (userId) => `@spendwise_budget_warning_${userId}`;

const getBudgetWarningStorageKey = (userId) => {
  const now = new Date();

  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}`;

  return `@spendwise_budget_warning_sent_${userId}_${monthKey}`;
};

const getOverBudgetNotificationId = (userId) =>
  `@spendwise_over_budget_${userId}`;

const getOverBudgetStorageKey = (userId) => {
  const now = new Date();

  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}`;

  return `@spendwise_over_budget_sent_${userId}_${monthKey}`;
};

const getDailyReminderId = (userId) =>
  `@spendwise_daily_expense_reminder_${userId}`;

export const configureNotifications = async () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("spendwise-reminders", {
      name: "SpendWise Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
};

export const requestNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === "granted") {
    return true;
  }

  const { status: requestedStatus } =
    await Notifications.requestPermissionsAsync();

  return requestedStatus === "granted";
};

export const scheduleDailyExpenseReminder = async (
  userId,
  hour = DAILY_REMINDER_HOUR,
  minute = DAILY_REMINDER_MINUTE,
) => {
  const notificationId = getDailyReminderId(userId);
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return false;
  }

  await cancelDailyExpenseReminder(userId);

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId,
    content: {
      title: "SpendWise Reminder",
      body: "Add your today's expense",
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: "spendwise-reminders",
    },
  });

  return true;
};

export const cancelDailyExpenseReminder = async (userId) => {
  try {
    const notificationId = getDailyReminderId(userId);

    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log("Failed to cancel daily reminder:", error.message);
  }
};

export const scheduleBudgetWarning = async (userId, budget, totalSpent) => {
  if (!userId || !budget) {
    return false;
  }

  const percentage = Number(totalSpent) / Number(budget);

  if (percentage < BUDGET_WARNING_THRESHOLD) {
    return false;
  }

  const storageKey = getBudgetWarningStorageKey(userId);

  const alreadySent = await AsyncStorage.getItem(storageKey);

  if (alreadySent === "true") {
    console.log("Budget warning skipped: already sent this month");

    return false;
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return false;
  }

  const notificationId = getBudgetWarningId(userId);

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId,
    content: {
      title: "SpendWise Budget Alert",
      body: `You've used ${Math.round(
        percentage * 100,
      )}% of your monthly budget.`,
      sound: "default",
    },
    trigger: null,
  });

  await AsyncStorage.setItem(storageKey, "true");

  return true;
};

export const scheduleOverBudgetNotification = async (
  userId,
  budget,
  totalSpent,
) => {
  if (!userId || !budget) {
    return false;
  }

  const percentage = Number(totalSpent) / Number(budget);

  if (percentage < 1) {
    return false;
  }

  const storageKey = getOverBudgetStorageKey(userId);

  const alreadySent = await AsyncStorage.getItem(storageKey);

  if (alreadySent === "true") {
    return false;
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return false;
  }

  const notificationId = getOverBudgetNotificationId(userId);

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId,
    content: {
      title: "SpendWise Over Budget",
      body: `You've exceeded your monthly budget by ${Math.round(
        (percentage - 1) * 100,
      )}%.`,
      sound: "default",
    },
    trigger: null,
  });

  await AsyncStorage.setItem(storageKey, "true");

  return true;
};

export const cancelAllDailyExpenseReminders = async () => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const spendWiseReminders = scheduledNotifications.filter(
      (notification) => notification.content?.title === "SpendWise Reminder",
    );

    for (const notification of spendWiseReminders) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }

    console.log(
      `Cancelled ${spendWiseReminders.length} SpendWise daily reminder(s).`,
    );
  } catch (error) {
    console.log("Failed to cancel all daily reminders:", error.message);
  }
};
