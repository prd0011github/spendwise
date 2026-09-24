import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
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
  getPendingTransactions,
  savePendingTransactions,
  syncPendingTransactions,
  addPendingTransactionUpdate,
} from "./services/transactionService";
import { getAuthToken } from "./services/authStorage";
import {
  fetchBudget,
  saveBudget,
  cacheBudget,
  getCachedBudget,
} from "./services/budgetService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [budget, setBudget] = useState(0);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("newest");

  const [transactionList, setTransactionList] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  const totalSpent = transactionList.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const remaining = budget - totalSpent;
  const getTransactionsCacheKey = (userId) =>
    `@spendwise_transactions_${userId}`;

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
    if (!user) {
      return;
    }

    const loadBudget = async () => {
      setIsBudgetLoading(true);

      try {
        // Load cached budget first
        const cachedBudget = await getCachedBudget(user.id);

        if (cachedBudget !== null) {
          setBudget(cachedBudget);
          setIsBudgetLoading(false);
        }

        // Then try to get the latest budget from server
        const token = await getAuthToken();

        if (!token) {
          return;
        }

        const budgetData = await fetchBudget(token);

        if (budgetData) {
          const serverBudget = Number(budgetData.budget);

          setBudget(serverBudget);

          await cacheBudget(user.id, serverBudget);
        }
      } catch (error) {
        console.log("Error loading budget from server:", error.message);

        // Cached budget is already displayed,
        // so nothing else is required here.
      } finally {
        setIsBudgetLoading(false);
      }
    };

    loadBudget();
  }, [user]);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const saveTransactions = async () => {
      try {
        const transactionsKey = getTransactionsCacheKey(user.id);

        await AsyncStorage.setItem(
          transactionsKey,
          JSON.stringify(transactionList),
        );
      } catch (error) {
        console.log("Error saving transactions:", error);
      }
    };

    saveTransactions();
  }, [transactionList, isLoaded, user]);

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

        if (session?.user) {
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

    const loadTransactions = async () => {
      const transactionsKey = getTransactionsCacheKey(user.id);

      // Load cached transactions immediately
      try {
        const cachedTransactions = await AsyncStorage.getItem(transactionsKey);

        if (cachedTransactions) {
          setTransactionList(JSON.parse(cachedTransactions));

          console.log("Loaded transactions from local cache");
        }
      } catch (cacheError) {
        console.log("Error loading transaction cache:", cacheError.message);
      } finally {
        setIsLoaded(true);
      }

      // Then try to refresh from server
      try {
        const token = await getAuthToken();

        if (!token) {
          return;
        }

        const serverTransactions = await fetchTransactions(token);

        setTransactionList(serverTransactions);

        await AsyncStorage.setItem(
          transactionsKey,
          JSON.stringify(serverTransactions),
        );
      } catch (error) {
        console.log(
          "Server unavailable, using cached transactions:",
          error.message,
        );
      }
    };

    loadTransactions();
  }, [user]);

  // Sync pending transactions when the user is logged in
  const syncPendingTransactionsNow = async () => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return;
      }

      const syncedTransactions = await syncPendingTransactions(user.id, token);

      if (syncedTransactions.length === 0) {
        return;
      }

      setTransactionList((currentTransactions) =>
        currentTransactions
          .filter((transaction) => {
            const syncedTransaction = syncedTransactions.find(
              (item) => item.localId === transaction.id,
            );

            return !(
              syncedTransaction && syncedTransaction.syncAction === "delete"
            );
          })
          .map((transaction) => {
            const syncedTransaction = syncedTransactions.find(
              (item) => item.localId === transaction.id,
            );

            return syncedTransaction
              ? syncedTransaction.transaction
              : transaction;
          }),
      );

      console.log("Pending transactions synced successfully");
    } catch (error) {
      console.log("Pending transaction sync failed:", error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    syncPendingTransactionsNow();
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        return;
      }

      syncPendingTransactionsNow();
    });

    return unsubscribe;
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
            <Text style={styles.smallAmount}>
              {isBudgetLoading ? "Loading..." : `₹${budget.toLocaleString()}`}
            </Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>Remaining</Text>
            <Text style={styles.smallAmount}>
              {isBudgetLoading
                ? "Loading..."
                : `₹${remaining.toLocaleString()}`}
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
        isSaving={isSavingTransaction}
        editingTransaction={editingTransaction}
        remaining={remaining}
        onSave={async (expense) => {
          if (isSavingTransaction) {
            return;
          }

          setIsSavingTransaction(true);

          if (editingTransactionId) {
            const updatedTransactionData = {
              name: expense.name.trim(),
              amount: expense.amount,
              category: expense.category,
            };

            try {
              const token = await getAuthToken();

              if (!token) {
                throw new Error("Authentication token is missing");
              }

              const updatedTransaction = await editTransaction(
                token,
                editingTransactionId,
                updatedTransactionData,
              );

              setTransactionList((currentTransactions) =>
                currentTransactions.map((transaction) =>
                  transaction.id === editingTransactionId
                    ? updatedTransaction
                    : transaction,
                ),
              );
            } catch (error) {
              console.log(
                "Server unavailable. Updating transaction locally:",
                error.message,
              );

              setTransactionList((currentTransactions) =>
                currentTransactions.map((transaction) =>
                  transaction.id === editingTransactionId
                    ? {
                        ...transaction,
                        ...updatedTransactionData,
                        isPendingSync: true,
                        syncAction: "update",
                      }
                    : transaction,
                ),
              );

              await addPendingTransactionUpdate(
                user.id,
                editingTransactionId,
                updatedTransactionData,
              );
            }
          } else {
            const today = new Date();

            const transactionDate = `${today.getFullYear()}-${String(
              today.getMonth() + 1,
            ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            const localTransaction = {
              id: `local_${Date.now()}`,
              name: expense.name.trim(),
              amount: expense.amount,
              category: expense.category,
              date: transactionDate,
              isPendingSync: true,
            };

            // Add transaction immediately to the UI
            setTransactionList((currentTransactions) => [
              ...currentTransactions,
              localTransaction,
            ]);

            try {
              const token = await getAuthToken();

              if (!token) {
                throw new Error("Authentication token is missing");
              }

              // Try to sync with the server
              const newTransaction = await addTransaction(token, {
                name: expense.name.trim(),
                amount: expense.amount,
                category: expense.category,
                date: transactionDate,
              });

              // Replace the local transaction with the server transaction
              setTransactionList((currentTransactions) =>
                currentTransactions.map((transaction) =>
                  transaction.id === localTransaction.id
                    ? newTransaction
                    : transaction,
                ),
              );

              console.log("Transaction synced successfully");
            } catch (error) {
              console.log(
                "Transaction saved locally. Sync pending:",
                error.message,
              );

              // Keep it as pending.
              // The transaction is already in transactionList
              // and will be persisted by the existing cache effect.

              const pendingTransactions = await getPendingTransactions(user.id);

              await savePendingTransactions(user.id, [
                ...pendingTransactions,
                localTransaction,
              ]);
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
          onSave={async (newBudget) => {
            try {
              const token = await getAuthToken();

              if (!token) {
                console.log("Authentication token is missing");
                return;
              }

              const budgetData = await saveBudget(token, newBudget);

              const updatedBudget = Number(budgetData.budget);

              setBudget(updatedBudget);

              await cacheBudget(user.id, updatedBudget);

              setShowBudgetForm(false);
            } catch (error) {
              console.log("Error saving budget:", error.message);
            }
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
