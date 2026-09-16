import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MonthlySummary({ transactions }) {
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

  currentMonth: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  month: {
    fontSize: 16,
    fontWeight: "600",
  },

  currentAmount: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 6,
  },

  comparison: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: "600",
  },

  increase: {
    color: "#DC2626",
  },

  decrease: {
    color: "#16A34A",
  },

  neutral: {
    color: "#64748B",
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
