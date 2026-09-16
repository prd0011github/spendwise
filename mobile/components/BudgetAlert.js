import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function BudgetAlert({ budget, totalSpent }) {
  if (budget <= 0) {
    return null;
  }

  const spendingPercentage = (totalSpent / budget) * 100;

  let message = "";
  let style = styles.normal;
  let icon = "";

  if (spendingPercentage >= 100) {
    message = "You have exceeded your budget";
    style = styles.danger;
    icon = "🚨";
  } else if (spendingPercentage >= 90) {
    message = "You are very close to your budget limit";
    style = styles.danger;
    icon = "⚠️";
  } else if (spendingPercentage >= 80) {
    message = "You have used 80% of your budget";
    style = styles.warning;
    icon = "⚠️";
  } else {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.content}>
        <Text style={styles.title}>Budget Alert</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },

  normal: {
    backgroundColor: "#F8FAFC",
  },

  warning: {
    backgroundColor: "#FEF3C7",
  },

  danger: {
    backgroundColor: "#FEE2E2",
  },

  icon: {
    fontSize: 24,
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  message: {
    fontSize: 14,
    marginTop: 3,
  },
});
