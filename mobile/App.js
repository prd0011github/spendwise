import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const transactions = [
  {
    id: 1,
    icon: "🛒",
    name: "Groceries",
    amount: 850,
  },
  {
    id: 2,
    icon: "☕",
    name: "Coffee",
    amount: 180,
  },
  {
    id: 3,
    icon: "🚕",
    name: "Transport",
    amount: 320,
  },
];

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [error, setError] = useState("");
  const [budget, setBudget] = useState(20000);

  const [transactionList, setTransactionList] = useState(transactions);

  const totalSpent = transactionList.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const remaining = budget - totalSpent;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.month}>September 2026</Text>
        </View>

        <Text style={styles.settings}>⚙️</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total spent</Text>
        <Text style={styles.amount}>₹{totalSpent.toLocaleString()}</Text>

        <View style={styles.budgetRow}>
          <View>
            <Text style={styles.smallLabel}>Budget</Text>
            <Text style={styles.smallAmount}>₹{budget.toLocaleString()}</Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>Remaining</Text>
            <Text style={styles.smallAmount}>
              ₹{remaining.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}

      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      {transactionList.map((transaction) => (
        <View key={transaction.id} style={styles.transaction}>
          <Text style={styles.transactionName}>
            {transaction.icon} {transaction.name}
          </Text>

          <Text style={styles.expense}>
            -₹{transaction.amount.toLocaleString()}
          </Text>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
        <Text style={styles.addButtonText}>＋ Add Expense</Text>
      </Pressable>
      {/* Expense Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Add Expense</Text>

          <TextInput
            style={styles.input}
            placeholder="Expense name"
            value={expenseName}
            onChangeText={setExpenseName}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={styles.saveButton}
            onPress={() => {
              const amount = Number(expenseAmount);

              if (!expenseName.trim()) {
                setError("Please enter an expense name");
                return;
              }

              if (!expenseAmount || amount <= 0) {
                setError("Please enter a valid amount");
                return;
              }

              if (amount > remaining) {
                setError("Expense exceeds your remaining budget");
                return;
              }
              // Add expense to the list
              const newTransaction = {
                id: Date.now(),
                name: expenseName,
                amount,
                icon: "🛒",
              };
              setTransactionList([...transactionList, newTransaction]);
              // Reset form
              setExpenseName("");
              setExpenseAmount("");
              setShowForm(false);
              setError("");
            }}
          >
            <Text style={styles.saveButtonText}>Save Expense</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              setShowForm(false);
              setExpenseName("");
              setExpenseAmount("");
              setError("");
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },

  greeting: {
    fontSize: 24,
    fontWeight: "700",
  },

  month: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
  },

  settings: {
    fontSize: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
  },

  cardLabel: {
    fontSize: 14,
    color: "#64748B",
  },

  amount: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 5,
  },

  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  smallLabel: {
    fontSize: 13,
    color: "#64748B",
  },

  smallAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 15,
  },

  transaction: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  transactionName: {
    fontSize: 16,
  },

  expense: {
    fontSize: 16,
    fontWeight: "600",
  },

  addButton: {
    marginTop: 25,
    backgroundColor: "#000000", //"#3B82F6"
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  /* Expense Form Styles */
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },

  saveButton: {
    backgroundColor: "#000000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelButton: {
    padding: 14,
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 16,
    color: "#64748B",
  },

  error: {
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 12,
  },
});
