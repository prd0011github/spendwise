import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function BudgetAlert({ budget, totalSpent }) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

  if (budget <= 0) {
    return null;
  }

  const spendingPercentage = (totalSpent / budget) * 100;

  let message = "";
  let style = styles.normal;
  let icon = "";

  if (spendingPercentage >= 100) {
    message = "You have exceeded your budget";
    style = styles.danger;
    icon = "🚨";
  } else if (spendingPercentage >= 90) {
    message = "You are very close to your budget limit";
    style = styles.danger;
    icon = "⚠️";
  } else if (spendingPercentage >= 80) {
    message = "You have used 80% of your budget";
    style = styles.warning;
    icon = "⚠️";
  } else {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.content}>
        <Text style={styles.title}>Budget Alert</Text>

        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: radius.md,
      padding: spacing.lg,
      marginTop: spacing.xl,
      borderWidth: 1,
    },

    normal: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
    },

    warning: {
      backgroundColor: colors.warningLight,
      borderColor: colors.warning,
    },

    danger: {
      backgroundColor: colors.dangerLight,
      borderColor: colors.danger,
    },

    icon: {
      fontSize: 24,
      marginRight: spacing.md,
    },

    content: {
      flex: 1,
    },

    title: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    message: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });
