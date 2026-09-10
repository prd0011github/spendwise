import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  View,
} from "react-native";

import React, { useEffect, useState } from "react";
import TransactionItem from "./components/TransactionItem";
import BudgetForm from "./components/BudgetForm";
import ExpenseForm from "./components/ExpenseForm";
import AsyncStorage from "@react-native-async-storage/async-storage";

const transactions = [
  {
    id: 1,
    name: "Groceries",
    amount: 850,
    category: "Shopping",
  },
  {
    id: 2,
    name: "Coffee",
    amount: 180,
    category: "Food",
  },
  {
    id: 3,
    name: "Transport",
    amount: 320,
    category: "Transport",
  },
];

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [budget, setBudget] = useState(20000);
  const [isBudgetLoaded, setIsBudgetLoaded] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const [transactionList, setTransactionList] = useState(transactions);

  const totalSpent = transactionList.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const remaining = budget - totalSpent;
  const TRANSACTIONS_KEY = "@spendwise_transactions";
  const BUDGET_KEY = "@spendwise_budget";

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);

        if (storedTransactions) {
          setTransactionList(JSON.parse(storedTransactions));
        }
      } catch (error) {
        console.log("Error loading transactions:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const storedBudget = await AsyncStorage.getItem(BUDGET_KEY);

        if (storedBudget) {
          setBudget(Number(storedBudget));
        }
      } catch (error) {
        console.log("Error loading budget:", error);
      } finally {
        setIsBudgetLoaded(true);
      }
    };

    loadBudget();
  }, []);

  useEffect(() => {
    if (!isBudgetLoaded) {
      return;
    }

    const saveBudget = async () => {
      try {
        await AsyncStorage.setItem(BUDGET_KEY, String(budget));
      } catch (error) {
        console.log("Error saving budget:", error);
      }
    };

    saveBudget();
  }, [budget, isBudgetLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(
          TRANSACTIONS_KEY,
          JSON.stringify(transactionList),
        );
      } catch (error) {
        console.log("Error saving transactions:", error);
      }
    };

    saveTransactions();
  }, [transactionList, isLoaded]);

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

        <Pressable
          onPress={() => {
            setShowBudgetForm(true);
          }}
        >
          <Text style={styles.settings}>⚙️</Text>
        </Pressable>
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

      <TransactionItem
        transactionList={transactionList}
        setTransactionList={setTransactionList}
        setEditingTransactionId={setEditingTransactionId}
        setEditingTransaction={setEditingTransaction}
        setShowForm={setShowForm}
      />

      <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
        <Text style={styles.addButtonText}>＋ Add Expense</Text>
      </Pressable>

      {/* Expense Form */}
      <ExpenseForm
        visible={showForm}
        editingTransaction={editingTransaction}
        remaining={remaining}
        onSave={(expense) => {
          if (editingTransactionId) {
            setTransactionList((currentTransactions) =>
              currentTransactions.map((transaction) =>
                transaction.id === editingTransactionId
                  ? {
                      ...transaction,
                      name: expense.name,
                      amount: expense.amount,
                      category: expense.category,
                    }
                  : transaction,
              ),
            );
          } else {
            const newTransaction = {
              id: Date.now(),
              name: expense.name,
              amount: expense.amount,
              category: expense.category,
            };

            setTransactionList((currentTransactions) => [
              ...currentTransactions,
              newTransaction,
            ]);
          }

          setShowForm(false);
          setEditingTransactionId(null);
          setEditingTransaction(null);
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingTransactionId(null);
          setEditingTransaction(null);
        }}
      />

      {/* Budget Form */}
      {showBudgetForm && (
        <BudgetForm
          budget={budget}
          totalSpent={totalSpent}
          onSave={(newBudget) => {
            setBudget(newBudget);
            setShowBudgetForm(false);
          }}
          onCancel={() => {
            setShowBudgetForm(false);
          }}
        />
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
});
