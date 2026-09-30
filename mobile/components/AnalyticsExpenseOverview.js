import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

const AnalyticsExpenseOverview = ({ transactions }) => {
  const { colors, spacing, typography, radius } = useTheme();
  const { formatAmount } = useCurrency();

  const categoryTotals = {};

  (transactions || []).forEach((transaction) => {
    const category = transaction.category || "Other";

    categoryTotals[category] =
      (categoryTotals[category] || 0) + Number(transaction.amount || 0);
  });

  const totalExpenses = Object.values(categoryTotals).reduce(
    (total, amount) => total + amount,
    0,
  );

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const styles = createStyles(colors, spacing, typography, radius);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense Overview</Text>

        <Text style={styles.transactionCount}>
          {transactions?.length || 0} transactions
        </Text>
      </View>

      {categoryBreakdown.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses recorded this month</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCircle}>
              <Text style={styles.summaryLabel}>Expenses</Text>

              <Text style={styles.summaryAmount}>
                {formatAmount(totalExpenses)}
              </Text>
            </View>
          </View>

          <View style={styles.categoryList}>
            {categoryBreakdown.map((item) => (
              <View key={item.category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryNameContainer}>
                    <View style={styles.categoryDot} />

                    <Text style={styles.categoryName}>{item.category}</Text>
                  </View>

                  <View style={styles.categoryAmountContainer}>
                    <Text style={styles.categoryAmount}>
                      {formatAmount(item.amount)}
                    </Text>

                    <Text style={styles.categoryPercentage}>
                      {item.percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${item.percentage}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },

    title: {
      ...typography.heading,
      color: colors.textPrimary,
    },

    transactionCount: {
      ...typography.caption,
      color: colors.textSecondary,
    },

    summaryContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    summaryCircle: {
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 18,
      borderColor: colors.primaryLight,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },

    summaryLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },

    summaryAmount: {
      ...typography.subheading,
      color: colors.textPrimary,
    },

    categoryList: {
      gap: spacing.lg,
    },

    categoryItem: {
      width: "100%",
    },

    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },

    categoryNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    categoryDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginRight: spacing.sm,
    },

    categoryName: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
    },

    categoryAmountContainer: {
      alignItems: "flex-end",
    },

    categoryAmount: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
    },

    categoryPercentage: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },

    progressBackground: {
      height: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: radius.round,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: radius.round,
    },

    emptyContainer: {
      paddingVertical: spacing.xxl,
      alignItems: "center",
    },

    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
    },
  });

export default AnalyticsExpenseOverview;
