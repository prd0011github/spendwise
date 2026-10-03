import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthUser } from "../services/authStorage";

import { useTheme } from "../context/ThemeContext";
import {
  scheduleDailyExpenseReminder,
  cancelDailyExpenseReminder,
} from "../services/notificationService";

export default function NotificationSettingsScreen({ onBack }) {
  const { colors, spacing, typography, radius } = useTheme();

  const styles = createStyles(colors, spacing, typography, radius);

  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [userId, setUserId] = useState(null);

  const getDailyReminderKey = (userId) =>
    `@spendwise_daily_expense_reminder_enabled_${userId}`;

  useEffect(() => {
    const loadReminderSetting = async () => {
      try {
        const user = await getAuthUser();

        if (!user?.id) {
          return;
        }

        setUserId(user.id);

        const key = getDailyReminderKey(user.id);

        const storedValue = await AsyncStorage.getItem(key);

        const enabled = storedValue === "true";
        console.log("Loaded daily reminder setting:", enabled);

        setDailyReminderEnabled(enabled);

        if (enabled) {
          await scheduleDailyExpenseReminder(user.id);
        }
      } catch (error) {
        console.log("Failed to load notification setting:", error.message);
      }
    };

    loadReminderSetting();
  }, []);

  const handleReminderToggle = async (enabled) => {
    try {
      if (!userId) {
        return;
      }

      setDailyReminderEnabled(enabled);

      const key = getDailyReminderKey(userId);

      await AsyncStorage.setItem(key, String(enabled));

      if (enabled) {
        await scheduleDailyExpenseReminder(userId);
      } else {
        await cancelDailyExpenseReminder(userId);
      }
    } catch (error) {
      console.log("Failed to update notification setting:", error.message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: spacing.lg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          Notifications
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <View
          style={[
            styles.settingRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
            },
          ]}
        >
          <View style={styles.settingInfo}>
            <Text
              style={[
                styles.settingTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Daily expense reminder
            </Text>

            <Text
              style={[
                styles.settingSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Remind me every day at 8:00 PM
            </Text>
          </View>

          <Switch
            value={dailyReminderEnabled}
            onValueChange={handleReminderToggle}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    header: {
      minHeight: 60,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    backButtonText: {
      color: colors.primary,
      fontSize: 32,
      lineHeight: 34,
      fontWeight: "400",
    },

    title: {
      flex: 1,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "700",
    },

    headerSpacer: {
      width: 24,
    },

    content: {
      paddingTop: 20,
    },

    settingRow: {
      minHeight: 80,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
    },

    settingInfo: {
      flex: 1,
      marginRight: 16,
    },

    settingTitle: {
      fontSize: 16,
      fontWeight: "600",
    },

    settingSubtitle: {
      marginTop: 4,
      fontSize: 13,
    },
  });
