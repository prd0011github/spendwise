import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";

const AnalyticsInsights = ({ transactions = [], budget = 0 }) => {
  const { colors, spacing, typography, radius } = useTheme();

  const insights = useMemo(() => {
    if (transactions.length === 0) {
      return [
        {
          type: "info",
          title: "No spending data yet",
          message:
            "Add some expenses to start seeing personalized spending insights.",
        },
      ];
    }

    const categoryTotals = {};

    transactions.forEach((transaction) => {
      const category = transaction.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(transaction.amount || 0);
    });

    const totalExpense = transactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );

    const highestCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const budgetAmount = Number(budget || 0);

    const budgetPercentage =
      budgetAmount > 0 ? (totalExpense / budgetAmount) * 100 : 0;

    const remainingBudget = Math.max(budgetAmount - totalExpense, 0);

    const generatedInsights = [];

    if (highestCategory) {
      const categoryPercentage =
        totalExpense > 0 ? (highestCategory[1] / totalExpense) * 100 : 0;

      generatedInsights.push({
        type: "category",
        title: `${highestCategory[0]} is your top expense`,
        message: `${categoryPercentage.toFixed(
          0,
        )}% of your spending went to ${highestCategory[0]}.`,
      });
    }

    if (budgetAmount > 0) {
      if (totalExpense > budgetAmount) {
        generatedInsights.push({
          type: "danger",
          title: "Budget exceeded",
          message: `You've exceeded your monthly budget by ₹${(
            totalExpense - budgetAmount
          ).toFixed(2)}.`,
        });
      } else if (budgetPercentage >= 90) {
        generatedInsights.push({
          type: "warning",
          title: "You're close to your budget",
          message: `You've used ${budgetPercentage.toFixed(
            0,
          )}% of your monthly budget. ₹${remainingBudget.toFixed(2)} remains.`,
        });
      } else {
        generatedInsights.push({
          type: "success",
          title: "You're within budget",
          message: `You've used ${budgetPercentage.toFixed(
            0,
          )}% of your monthly budget. ₹${remainingBudget.toFixed(2)} remains.`,
        });
      }
    }

    return generatedInsights;
  }, [transactions, budget]);

  const getInsightStyle = (type) => {
    switch (type) {
      case "danger":
        return {
          backgroundColor: colors.dangerLight,
          iconBackground: colors.danger,
        };

      case "warning":
        return {
          backgroundColor: colors.warningLight,
          iconBackground: colors.warning,
        };

      case "success":
        return {
          backgroundColor: colors.successLight,
          iconBackground: colors.success,
        };

      default:
        return {
          backgroundColor: colors.primaryLight,
          iconBackground: colors.primary,
        };
    }
  };

  const styles = createStyles(colors, spacing, typography, radius);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending Insights</Text>

        <Text style={styles.subtitle}>Based on this month</Text>
      </View>

      <View style={styles.insightList}>
        {insights.map((insight, index) => {
          const insightStyle = getInsightStyle(insight.type);

          return (
            <View
              key={`${insight.type}-${index}`}
              style={[
                styles.insightCard,
                {
                  backgroundColor: insightStyle.backgroundColor,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: insightStyle.iconBackground,
                  },
                ]}
              >
                <Text style={styles.icon}>i</Text>
              </View>

              <View style={styles.content}>
                <Text style={styles.insightTitle}>{insight.title}</Text>

                <Text style={styles.message}>{insight.message}</Text>
              </View>
            </View>
          );
        })}
      </View>
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
      marginBottom: spacing.lg,
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

    insightList: {
      gap: spacing.md,
    },

    insightCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: spacing.md,
      borderRadius: radius.md,
    },

    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: radius.round,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },

    icon: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },

    content: {
      flex: 1,
    },

    insightTitle: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },

    message: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 21,
    },
  });

export default AnalyticsInsights;
