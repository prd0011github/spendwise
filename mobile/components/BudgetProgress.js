import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function BudgetProgress({ budget, totalSpent }) {
  if (budget <= 0) {
    return null;
  }

  const percentage = Math.min((totalSpent / budget) * 100, 100);
  const remaining = Math.max(budget - totalSpent, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Progress</Text>

        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>

      <View style={styles.progressBackground}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.spent}>₹{totalSpent.toLocaleString()} spent</Text>

        <Text style={styles.remaining}>
          ₹{remaining.toLocaleString()} remaining
        </Text>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  percentage: {
    fontSize: 16,
    fontWeight: "700",
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 15,
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 10,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  spent: {
    fontSize: 13,
    color: "#64748B",
  },

  remaining: {
    fontSize: 13,
    color: "#64748B",
  },
});
