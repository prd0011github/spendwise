import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import React, { useEffect, useState } from "react";
import TransactionItem from "./components/TransactionItem";
import BudgetForm from "./components/BudgetForm";
import ExpenseForm from "./components/ExpenseForm";
import CategorySummary from "./components/categorySummary";
import TopSpending from "./components/TopSpending";
import MonthlySummary from "./components/MonthlySummary";
import TransactionFilter from "./components/TransactionFilter";
import BudgetAlert from "./components/BudgetAlert";
import BudgetProgress from "./components/BudgetProgress";
import TransactionSort from "./components/TransactionSort";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { logout, restoreSession } from "./services/authService";
import {
  fetchTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
} from "./services/transactionService";
import { getAuthToken } from "./services/authStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const transactions = [
  {
    id: 1,
    name: "Groceries",
    amount: 850,
    category: "Shopping",
    date: "2026-09-01",
  },
  {
    id: 2,
    name: "Coffee",
    amount: 180,
    category: "Food",
    date: "2026-08-02",
  },
  {
    id: 3,
    name: "Transport",
    amount: 320,
    category: "Transport",
    date: "2026-10-03",
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
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("newest");

  const [transactionList, setTransactionList] = useState(transactions);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  const totalSpent = transactionList.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const remaining = budget - totalSpent;
  const TRANSACTIONS_KEY = "@spendwise_transactions";
  const BUDGET_KEY = "@spendwise_budget";

  const displayedTransactions = transactionList
    .filter((transaction) => {
      const matchesSearch = transaction.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        (transaction.category || "Other") === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "oldest":
          return new Date(a.date) - new Date(b.date);

        case "highest":
          return b.amount - a.amount;

        case "lowest":
          return a.amount - b.amount;

        case "newest":
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  const recentTransactions = showAllTransactions
    ? displayedTransactions
    : displayedTransactions.slice(0, 5);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);

        // if (storedTransactions) {
        //   setTransactionList(JSON.parse(storedTransactions));
        // }

        if (storedTransactions) {
          const parsedTransactions = JSON.parse(storedTransactions);

          if (parsedTransactions.length > 0) {
            setTransactionList(parsedTransactions);
          } else {
            setTransactionList(transactions);
          }
        } else {
          setTransactionList(transactions);
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

  // Logout handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowRegister(false);
  };

  // Authentication restoration
  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        const session = await restoreSession();

        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.log("Error restoring session:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreUserSession();
  }, []);

  // Fetch transactions from the server when the user is logged in
  useEffect(() => {
    if (!user) {
      return;
    }

    const loadServerTransactions = async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          return;
        }

        const serverTransactions = await fetchTransactions(token);

        setTransactionList(serverTransactions);
      } catch (error) {
        console.log("Error loading server transactions:", error.message);
      }
    };

    loadServerTransactions();
  }, [user]);

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <RegisterScreen
          onLogin={() => setShowRegister(false)}
          onRegister={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={(data) => setUser(data.user)}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {new Date().getHours() < 12
              ? "Good morning 👋"
              : new Date().getHours() < 18
                ? "Good afternoon 👋"
                : "Good evening 👋"}
          </Text>
          <Text style={styles.month}>
            {new Date().toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            setShowBudgetForm(true);
          }}
        >
          <Text style={styles.settings}>⚙️</Text>
        </Pressable>
        <Pressable onPress={handleLogout}>
          <Text style={styles.settings}>Logout</Text>
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

      <BudgetAlert budget={budget} totalSpent={totalSpent} />
      <BudgetProgress budget={budget} totalSpent={totalSpent} />

      <TransactionFilter
        searchText={searchText}
        setSearchText={setSearchText}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <TransactionSort
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />

      {/* Recent Transactions */}

      <TransactionItem
        displayedTransactions={recentTransactions}
        totalDisplayedTransactions={displayedTransactions.length}
        showAllTransactions={showAllTransactions}
        setShowAllTransactions={setShowAllTransactions}
        setTransactionList={setTransactionList}
        setEditingTransactionId={setEditingTransactionId}
        setEditingTransaction={setEditingTransaction}
        setShowForm={setShowForm}
      />

      <TopSpending transactions={transactionList} />

      <CategorySummary transactions={transactionList} />

      <MonthlySummary transactions={transactionList} />

      <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
        <Text style={styles.addButtonText}>＋ Add Expense</Text>
      </Pressable>

      {/* Expense Form */}
      <ExpenseForm
        visible={showForm}
        editingTransaction={editingTransaction}
        remaining={remaining}
        onSave={async (expense) => {
          if (editingTransactionId) {
            try {
              const token = await getAuthToken();

              if (!token) {
                console.log("Authentication token is missing");
                return;
              }

              const updatedTransaction = await editTransaction(
                token,
                editingTransactionId,
                {
                  name: expense.name.trim(),
                  amount: expense.amount,
                  category: expense.category,
                },
              );

              setTransactionList((currentTransactions) =>
                currentTransactions.map((transaction) =>
                  transaction.id === editingTransactionId
                    ? updatedTransaction
                    : transaction,
                ),
              );
            } catch (error) {
              console.log("Error updating transaction:", error.message);

              return;
            }
          } else {
            try {
              const token = await getAuthToken();

              if (!token) {
                console.log("Authentication token is missing");
                return;
              }

              const today = new Date();

              const transactionDate = `${today.getFullYear()}-${String(
                today.getMonth() + 1,
              ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

              const newTransaction = await addTransaction(token, {
                name: expense.name.trim(),
                amount: expense.amount,
                category: expense.category,
                date: transactionDate,
              });

              setTransactionList((currentTransactions) => [
                ...currentTransactions,
                newTransaction,
              ]);
            } catch (error) {
              console.log("Error adding transaction:", error.message);

              return;
            }
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

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
