import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function BudgetProgress({ budget, totalSpent }) {
  const { colors, spacing, radius } = useTheme();

  if (budget <= 0) {
    return null;
  }

  const percentage = Math.min((totalSpent / budget) * 100, 100);
  const remaining = Math.max(budget - totalSpent, 0);

  const styles = createStyles(colors, spacing, radius);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Progress</Text>

        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.spent}>₹{totalSpent.toLocaleString()} spent</Text>

        <Text style={styles.remaining}>
          ₹{remaining.toLocaleString()} remaining
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.xl,
      marginTop: spacing.xl,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    percentage: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    progressBackground: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: radius.round,
      overflow: "hidden",
      marginTop: spacing.md,
    },

    progressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: radius.round,
    },

    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },

    spent: {
      fontSize: 13,
      color: colors.textSecondary,
    },

    remaining: {
      fontSize: 13,
      color: colors.textSecondary,
    },
  });
