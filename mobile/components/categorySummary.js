import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getCategoryIcon } from "../utils/categoryUtils";
import { useTheme } from "../context/ThemeContext";

export default function CategorySummary({ transactions }) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

  const categoryTotals = transactions.reduce((totals, transaction) => {
    const category = transaction.category || "Other";

    totals[category] = (totals[category] || 0) + transaction.amount;

    return totals;
  }, {});

  const totalSpent = transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const summary = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (summary.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending by Category</Text>

      {summary.map((item) => {
        const transactionCount = transactions.filter(
          (transaction) => (transaction.category || "Other") === item.category,
        ).length;

        return (
          <View key={item.category} style={styles.categoryRow}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <Text style={styles.icon}>
                  {getCategoryIcon(item.category)}
                </Text>

                <View>
                  <Text style={styles.categoryName}>{item.category}</Text>

                  <Text style={styles.transactionCount}>
                    {transactionCount}{" "}
                    {transactionCount === 1 ? "transaction" : "transactions"}
                  </Text>
                </View>
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.amount}>
                  ₹{item.amount.toLocaleString()}
                </Text>

                <Text style={styles.percentage}>{item.percentage}%</Text>
              </View>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[styles.progressBar, { width: `${item.percentage}%` }]}
              />
            </View>
          </View>
        );
      })}
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

    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },

    categoryRow: {
      marginBottom: spacing.lg,
    },

    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    categoryInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingRight: spacing.md,
    },

    icon: {
      fontSize: 24,
      marginRight: spacing.md,
    },

    categoryName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },

    transactionCount: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },

    amountContainer: {
      alignItems: "flex-end",
    },

    amount: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    percentage: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },

    progressBackground: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: radius.round,
      marginTop: spacing.sm,
      overflow: "hidden",
    },

    progressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: radius.round,
    },
  });
