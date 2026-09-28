import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function MonthlySummary({ transactions }) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

  const monthlyTotals = transactions.reduce((totals, transaction) => {
    if (!transaction.date) {
      return totals;
    }

    const monthKey = transaction.date.slice(0, 7);

    totals[monthKey] = (totals[monthKey] || 0) + transaction.amount;

    return totals;
  }, {});

  const months = Object.entries(monthlyTotals)
    .map(([month, amount]) => ({
      month,
      amount,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  if (months.length === 0) {
    return null;
  }

  const formatMonth = (month) => {
    const date = new Date(`${month}-01T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  const today = new Date();

  const currentMonthKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;

  const currentMonth = {
    month: currentMonthKey,
    amount: monthlyTotals[currentMonthKey] || 0,
  };

  const previousDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const previousMonthKey = `${previousDate.getFullYear()}-${String(
    previousDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const previousMonth = {
    month: previousMonthKey,
    amount: monthlyTotals[previousMonthKey] || 0,
  };

  let comparisonText = "No previous month data";
  let comparisonStyle = styles.neutral;

  if (previousMonth && previousMonth.amount > 0) {
    const difference = currentMonth.amount - previousMonth.amount;

    const percentage = Math.round(
      (Math.abs(difference) / previousMonth.amount) * 100,
    );

    if (difference > 0) {
      comparisonText = `↑ ${percentage}% more than ${formatMonth(
        previousMonth.month,
      )}`;

      comparisonStyle = styles.increase;
    } else if (difference < 0) {
      comparisonText = `↓ ${percentage}% less than ${formatMonth(
        previousMonth.month,
      )}`;

      comparisonStyle = styles.decrease;
    } else {
      comparisonText = `Same as ${formatMonth(previousMonth.month)}`;

      comparisonStyle = styles.neutral;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Spending</Text>

      <View style={styles.currentMonth}>
        <Text style={styles.month}>{formatMonth(currentMonth.month)}</Text>

        <Text style={styles.currentAmount}>
          ₹{currentMonth.amount.toLocaleString()}
        </Text>

        <Text style={[styles.comparison, comparisonStyle]}>
          {comparisonText}
        </Text>
      </View>

      {months.slice(1).map((item) => (
        <View key={item.month} style={styles.monthRow}>
          <Text style={styles.month}>{formatMonth(item.month)}</Text>

          <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
        </View>
      ))}
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

    currentMonth: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: radius.md,
      padding: spacing.lg,
      marginBottom: spacing.sm,
    },

    month: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },

    currentAmount: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: spacing.xs,
    },

    comparison: {
      fontSize: 14,
      marginTop: spacing.xs,
      fontWeight: "600",
    },

    increase: {
      color: colors.danger,
    },

    decrease: {
      color: colors.success,
    },

    neutral: {
      color: colors.textSecondary,
    },

    monthRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    amount: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },
  });
