import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getCategoryIcon } from "../utils/categoryUtils";

export default function TopSpending({ transactions }) {
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
            ₹{amount.toLocaleString()} · {percentage}% of your spending
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 38,
    marginRight: 15,
  },

  info: {
    flex: 1,
  },

  message: {
    fontSize: 14,
    color: "#64748B",
  },

  category: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },

  details: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
  },
});
