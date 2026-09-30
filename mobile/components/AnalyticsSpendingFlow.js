import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

const AnalyticsSpendingFlow = ({ transactions }) => {
  const { colors, spacing, typography, radius } = useTheme();
  const { formatAmount } = useCurrency();

  const weeklySpending = useMemo(() => {
    const weeks = [
      { label: "Week 1", amount: 0 },
      { label: "Week 2", amount: 0 },
      { label: "Week 3", amount: 0 },
      { label: "Week 4", amount: 0 },
      { label: "Week 5", amount: 0 },
    ];

    (transactions || []).forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const dayOfMonth = transactionDate.getDate();

      const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);

      weeks[weekIndex].amount += Number(transaction.amount || 0);
    });

    return weeks;
  }, [transactions]);

  const maxAmount = Math.max(...weeklySpending.map((week) => week.amount), 0);

  const totalSpending = weeklySpending.reduce(
    (total, week) => total + week.amount,
    0,
  );

  const styles = createStyles(colors, spacing, typography, radius);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Spending Flow</Text>

          <Text style={styles.subtitle}>Weekly spending</Text>
        </View>

        <Text style={styles.totalAmount}>{formatAmount(totalSpending)}</Text>
      </View>

      {maxAmount === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses recorded this month</Text>
        </View>
      ) : (
        <View style={styles.chart}>
          {weeklySpending.map((week) => {
            const barHeight =
              maxAmount > 0
                ? Math.max(
                    (week.amount / maxAmount) * 150,
                    week.amount > 0 ? 8 : 0,
                  )
                : 0;

            return (
              <View key={week.label} style={styles.barColumn}>
                <Text style={styles.barAmount}>
                  {week.amount > 0
                    ? `${formatAmount(week.amount)}`
                    : formatAmount("0")}
                </Text>

                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.weekLabel}>
                  {week.label.replace("Week ", "W")}
                </Text>
              </View>
            );
          })}
        </View>
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
      marginBottom: spacing.xl,
    },

    title: {
      ...typography.heading,
      color: colors.textPrimary,
    },

    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },

    totalAmount: {
      ...typography.subheading,
      color: colors.primary,
    },

    chart: {
      height: 210,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: spacing.lg,
    },

    barColumn: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "flex-end",
      marginHorizontal: spacing.xs,
    },

    barAmount: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      fontSize: 11,
    },

    barContainer: {
      height: 150,
      width: "60%",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: radius.sm,
      overflow: "hidden",
    },

    bar: {
      width: "100%",
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
    },

    weekLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },

    emptyContainer: {
      height: 180,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
    },
  });

export default AnalyticsSpendingFlow;
