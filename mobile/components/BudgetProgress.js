import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

export default function BudgetProgress({ budget, totalSpent }) {
  const { colors, spacing, radius } = useTheme();
  const { formatAmount } = useCurrency();

  if (budget <= 0) {
    return null;
  }

  const percentage = Math.min((totalSpent / budget) * 100, 100);

  const budgetDifference = budget - totalSpent;
  const isOverBudget = budgetDifference < 0;

  const remaining = Math.max(budgetDifference, 0);
  const overBudget = Math.max(-budgetDifference, 0);

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
        <Text style={styles.spent}>{formatAmount(totalSpent)} spent</Text>

        <Text style={[styles.remaining, isOverBudget && styles.overBudget]}>
          {isOverBudget
            ? `${formatAmount(overBudget)} over`
            : `${formatAmount(remaining)} remaining`}
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
    overBudget: {
      color: colors.danger,
      fontWeight: "600",
    },
  });
