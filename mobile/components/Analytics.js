import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AnalyticsExpenseOverview from "../components/AnalyticsExpenseOverview";
import AnalyticsSpendingFlow from "../components/AnalyticsSpendingFlow";
import AnalyticsInsights from "../components/AnalyticsInsights";
import MonthSelector from "../components/monthSelector";

import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

export default function Analytics({
  setShowAnalytics,
  transactions = [],
  budget = 0,
  previousMonth,
  nextMonth,
  selectedDate,
  getMonthYear,
  onUpgradePress,
  hasProAccess,
}) {
  const { colors, spacing, typography, radius } = useTheme();
  const { formatAmount } = useCurrency();

  const styles = createStyles(colors, spacing, typography, radius);

  const handleBack = () => {
    setShowAnalytics(false);
  };

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transactionDate.getFullYear() === selectedDate.getFullYear() &&
        transactionDate.getMonth() === selectedDate.getMonth()
      );
    });
  }, [transactions, selectedDate]);

  const totalExpense = useMemo(() => {
    return monthlyTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );
  }, [monthlyTransactions]);

  const previousMonthTransactions = useMemo(() => {
    const previousDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
      1,
    );

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transactionDate.getFullYear() === previousDate.getFullYear() &&
        transactionDate.getMonth() === previousDate.getMonth()
      );
    });
  }, [transactions, selectedDate]);

  const previousMonthExpense = useMemo(() => {
    return previousMonthTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );
  }, [previousMonthTransactions]);

  const spendingChange = totalExpense - previousMonthExpense;

  const spendingChangePercentage =
    previousMonthExpense > 0
      ? (spendingChange / previousMonthExpense) * 100
      : null;

  const budgetAmount = Number(budget || 0);

  const budgetDifference = budgetAmount - totalExpense;

  const isOverBudget = budgetDifference < 0;

  const remainingBudget = Math.max(budgetDifference, 0);

  const overBudgetAmount = Math.max(-budgetDifference, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to dashboard"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Analytics</Text>
      </View>
      <MonthSelector
        previousMonth={previousMonth}
        nextMonth={nextMonth}
        selectedDate={selectedDate}
        getMonthYear={getMonthYear}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>EXPENSE</Text>

          <Text style={[styles.summaryValue, { color: colors.danger }]}>
            {formatAmount(totalExpense)}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>BUDGET</Text>

          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatAmount(Number(budget || 0))}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            {isOverBudget ? "OVER BUDGET" : "REMAINING"}
          </Text>

          <Text
            style={[
              styles.summaryValue,
              {
                color: isOverBudget ? colors.danger : colors.success,
              },
            ]}
          >
            {formatAmount(isOverBudget ? overBudgetAmount : remainingBudget)}
          </Text>
        </View>
      </View>

      {hasProAccess && (
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Month-over-month spending</Text>

          <Text style={styles.comparisonAmount}>
            {formatAmount(previousMonthExpense)}
          </Text>

          <Text style={styles.comparisonLabel}>Previous month</Text>

          <Text
            style={[
              styles.comparisonChange,
              {
                color:
                  spendingChange > 0
                    ? colors.danger
                    : spendingChange < 0
                      ? colors.success
                      : colors.textSecondary,
              },
            ]}
          >
            {spendingChangePercentage === null
              ? "No previous-month spending to compare"
              : `${Math.abs(spendingChangePercentage).toFixed(1)}% ${
                  spendingChange > 0
                    ? "more spent"
                    : spendingChange < 0
                      ? "less spent"
                      : "no change"
                } compared with the previous month`}
          </Text>
        </View>
      )}

      <AnalyticsExpenseOverview transactions={monthlyTransactions} />
      <AnalyticsSpendingFlow transactions={monthlyTransactions} />
      <AnalyticsInsights transactions={monthlyTransactions} budget={budget} />
      <View style={styles.proSection}>
        <Text style={styles.proTitle}>Advanced analytics</Text>

        {hasProAccess ? (
          <View>
            <Text style={styles.proDescription}>
              Pro access is active. Advanced comparisons and category trends
              will appear here.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.proDescription}>
              Unlock month-to-month comparisons, yearly spending trends, and
              detailed category insights with SpendWise Pro.
            </Text>

            <Pressable
              style={styles.proButton}
              onPress={onUpgradePress}
              accessibilityRole="button"
            >
              <Text style={styles.proButtonText}>Explore SpendWise Pro</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    contentContainer: {
      paddingBottom: spacing.xxl,
    },

    title: {
      ...typography.title,
      color: colors.textPrimary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },

    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
      marginRight: spacing.sm,
    },

    backButtonText: {
      fontSize: 32,
      lineHeight: 34,
      color: colors.primary,
      fontWeight: "400",
    },

    summaryContainer: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      marginBottom: spacing.xl,
    },

    summaryItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xs,
    },

    summaryDivider: {
      width: 1,
      backgroundColor: colors.border,
    },

    summaryLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "700",
      marginBottom: spacing.xs,
    },

    summaryValue: {
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },

    proSection: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    proTitle: {
      ...typography.heading,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    proDescription: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    proButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
    },
    proButtonText: {
      color: colors.onPrimary || "#FFFFFF",
      fontWeight: "700",
    },

    comparisonCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    comparisonTitle: {
      ...typography.heading,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    comparisonAmount: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    comparisonLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    comparisonChange: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: spacing.md,
    },
  });
