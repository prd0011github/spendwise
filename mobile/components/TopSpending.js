import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getCategoryIcon } from "../utils/categoryUtils";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

export default function TopSpending({ transactions }) {
  const { colors, spacing, radius } = useTheme();
  const { formatAmount } = useCurrency();

  const styles = createStyles(colors, spacing, radius);

  if (transactions.length === 0) {
    return null;
  }

  const categoryTotals = transactions.reduce((totals, transaction) => {
    const category = transaction.category || "Other";

    totals[category] = (totals[category] || 0) + transaction.amount;

    return totals;
  }, {});

  const topCategory = Object.entries(categoryTotals).reduce((top, current) => {
    return current[1] > top[1] ? current : top;
  });

  const [category, amount] = topCategory;

  const totalSpent = transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const percentage =
    totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 Top Spending</Text>

      <View style={styles.content}>
        <Text style={styles.icon}>{getCategoryIcon(category)}</Text>

        <View style={styles.info}>
          <Text style={styles.message}>You're spending the most on</Text>

          <Text style={styles.category}>{category}</Text>

          <Text style={styles.details}>
            {formatAmount(amount)} · {percentage}% of your spending
          </Text>
        </View>
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

    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },

    content: {
      flexDirection: "row",
      alignItems: "center",
    },

    icon: {
      fontSize: 38,
      marginRight: spacing.md,
    },

    info: {
      flex: 1,
    },

    message: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    category: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 2,
    },

    details: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });
