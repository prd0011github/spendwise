import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getCategoryIcon } from "../utils/categoryUtils";

export default function CategorySummary({ transactions }) {
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

      {summary.map((item) => (
        <View key={item.category} style={styles.categoryRow}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <Text style={styles.icon}>{getCategoryIcon(item.category)}</Text>

              <View>
                <Text style={styles.categoryName}>{item.category}</Text>

                <Text style={styles.transactionCount}>
                  {
                    transactions.filter(
                      (transaction) =>
                        (transaction.category || "Other") === item.category,
                    ).length
                  }{" "}
                  {transactions.filter(
                    (transaction) =>
                      (transaction.category || "Other") === item.category,
                  ).length === 1
                    ? "transaction"
                    : "transactions"}
                </Text>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>

              <Text style={styles.percentage}>{item.percentage}%</Text>
            </View>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[styles.progressBar, { width: `${item.percentage}%` }]}
            />
          </View>
        </View>
      ))}
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
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },

  categoryRow: {
    marginBottom: 18,
  },

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 24,
    marginRight: 12,
  },

  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },

  transactionCount: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },

  amountContainer: {
    alignItems: "flex-end",
  },

  amount: {
    fontSize: 16,
    fontWeight: "700",
  },

  percentage: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },

  progressBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 10,
  },
});
