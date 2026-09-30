import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AnalyticsExpenseOverview from "../components/AnalyticsExpenseOverview";
import AnalyticsSpendingFlow from "../components/AnalyticsSpendingFlow";
import AnalyticsInsights from "../components/AnalyticsInsights";

import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

const getMonthYear = (date) => {
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
};

export default function Analytics({
  setShowAnalytics,
  transactions = [],
  budget = 0,
}) {
  const { colors, spacing, typography, radius } = useTheme();
  const { formatAmount } = useCurrency();

  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const budgetAmount = Number(budget || 0);

  const budgetDifference = budgetAmount - totalExpense;

  const isOverBudget = budgetDifference < 0;

  const remainingBudget = Math.max(budgetDifference, 0);

  const overBudgetAmount = Math.max(-budgetDifference, 0);

  const previousMonth = () => {
    setSelectedDate((currentDate) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setSelectedDate((currentDate) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

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

      <View style={styles.monthSelector}>
        <Pressable style={styles.monthButton} onPress={previousMonth}>
          <Text style={styles.monthArrow}>‹</Text>
        </Pressable>

        <Text style={styles.monthText}>{getMonthYear(selectedDate)}</Text>

        <Pressable style={styles.monthButton} onPress={nextMonth}>
          <Text style={styles.monthArrow}>›</Text>
        </Pressable>
      </View>

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

      <AnalyticsExpenseOverview transactions={monthlyTransactions} />
      <AnalyticsSpendingFlow transactions={monthlyTransactions} />
      <AnalyticsInsights transactions={monthlyTransactions} budget={budget} />
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

    monthSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.lg,
    },

    monthButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
    },

    monthArrow: {
      fontSize: 32,
      lineHeight: 34,
      color: colors.primary,
      fontWeight: "400",
    },

    monthText: {
      ...typography.heading,
      color: colors.textPrimary,
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
  });
