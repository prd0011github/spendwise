import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

import { exportTransactionsToCsv } from "./services/exportService";
import { printTransactionsReport } from "./services/printService";

import TransactionItem from "./components/TransactionItem";
import CategorySummary from "./components/categorySummary";
import TopSpending from "./components/TopSpending";
import MonthlySummary from "./components/MonthlySummary";
import TransactionFilter from "./components/TransactionFilter";
import BudgetAlert from "./components/BudgetAlert";
import BudgetProgress from "./components/BudgetProgress";
import TransactionSort from "./components/TransactionSort";
import ModalComponent from "./components/Modal";
import Analytics from "./components/Analytics";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import FormScreen from "./screens/FormScreen";
import CurrencySetupScreen from "./screens/CurrencySetupScreen";

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
  savePendingBudget,
  clearPendingBudget,
  syncPendingBudget,
} from "./services/budgetService";

import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider, useCurrency } from "./context/CurrencyContext";
import { useTheme } from "./context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

function App() {
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

  const [showMenu, setShowMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);

  const { colors, spacing, typography, radius } = useTheme();
  const {
    loadUserCurrency,
    isCurrencySetupCompleted,
    completeCurrencySetup,
    formatAmount,
  } = useCurrency();

  const styles = createStyles(colors, spacing, typography, radius);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  const handleExportTransactions = async () => {
    try {
      await exportTransactionsToCsv(transactionList);
    } catch (error) {
      console.log("Transaction export failed:", error.message);
    }
  };

  const handlePrintReport = async () => {
    try {
      await printTransactionsReport(transactionList, formatAmount);
    } catch (error) {
      console.log("Print report failed:", error.message);
    }
  };

  const totalSpent = transactionList.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const remaining = budget - totalSpent;
  const isOverBudget = remaining < 0;
  const overBudgetAmount = Math.abs(remaining);

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

  // currency setup
  useEffect(() => {
    if (!user) {
      setShowCurrency(false);
      return;
    }

    const checkCurrencySetup = async () => {
      try {
        await loadUserCurrency(user.id);

        const isCompleted = await isCurrencySetupCompleted(user.id);

        setShowCurrency(!isCompleted);
      } catch (error) {
        console.log("Failed to check currency setup:", error.message);
      }
    };

    void checkCurrencySetup();
  }, [user]);

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

      try {
        // 1. Load cached transactions first
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

      try {
        const token = await getAuthToken();

        if (!token) {
          return;
        }

        // 2. Sync pending offline operations first
        const syncedTransactions = await syncPendingTransactions(
          user.id,
          token,
        );

        console.log("Pending transactions synced:", syncedTransactions);

        // 3. Fetch latest server transactions
        const serverTransactions = await fetchTransactions(token);

        // 4. Use server as the latest source of truth
        setTransactionList(serverTransactions);

        await AsyncStorage.setItem(
          transactionsKey,
          JSON.stringify(serverTransactions),
        );

        console.log("Transactions refreshed from server");
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

    const syncPendingData = async () => {
      const token = await getAuthToken();

      if (!token) {
        return;
      }

      await syncPendingTransactionsNow();

      const syncedBudget = await syncPendingBudget(user.id, token);

      if (syncedBudget !== null) {
        setBudget(syncedBudget);
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        return;
      }

      void syncPendingData();
    });

    return unsubscribe;
  }, [user]);

  const handleSaveExpense = async (expense) => {
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

      const transactionId = editingTransactionId;

      // Update UI immediately
      setTransactionList((currentTransactions) =>
        currentTransactions.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                ...updatedTransactionData,
                isPendingSync: true,
                syncAction: "update",
              }
            : transaction,
        ),
      );

      // Close form immediately
      setShowForm(false);
      setEditingTransactionId(null);
      setEditingTransaction(null);

      // Local operation is complete
      setIsSavingTransaction(false);

      // Sync with server in the background
      void (async () => {
        try {
          const token = await getAuthToken();

          if (!token) {
            throw new Error("Authentication token is missing");
          }

          const updatedTransaction = await editTransaction(
            token,
            transactionId,
            updatedTransactionData,
          );

          // Replace local transaction with server transaction
          setTransactionList((currentTransactions) =>
            currentTransactions.map((transaction) =>
              transaction.id === transactionId
                ? updatedTransaction
                : transaction,
            ),
          );

          console.log("Transaction updated successfully");
        } catch (error) {
          console.log(
            "Transaction updated locally. Sync pending:",
            error.message,
          );

          await addPendingTransactionUpdate(
            user.id,
            transactionId,
            updatedTransactionData,
          );
        }
      })();

      return;
    }

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

    // Add transaction immediately to UI
    setTransactionList((currentTransactions) => [
      ...currentTransactions,
      localTransaction,
    ]);

    // Close form immediately
    setShowForm(false);
    setEditingTransactionId(null);
    setEditingTransaction(null);

    // Local operation is complete
    setIsSavingTransaction(false);

    // Sync with server in the background
    void (async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Authentication token is missing");
        }

        const newTransaction = await addTransaction(token, {
          name: expense.name.trim(),
          amount: expense.amount,
          category: expense.category,
          date: transactionDate,
        });

        // Replace local transaction with server transaction
        setTransactionList((currentTransactions) =>
          currentTransactions.map((transaction) =>
            transaction.id === localTransaction.id
              ? newTransaction
              : transaction,
          ),
        );

        console.log("Transaction synced successfully");
      } catch (error) {
        console.log("Transaction saved locally. Sync pending:", error.message);

        const pendingTransactions = await getPendingTransactions(user.id);

        await savePendingTransactions(user.id, [
          ...pendingTransactions,
          localTransaction,
        ]);
      }
    })();
  };

  const handleSaveBudget = async (newBudget) => {
    try {
      const updatedBudget = Number(newBudget);

      if (!updatedBudget || updatedBudget <= 0) {
        return;
      }

      // Update UI immediately
      setBudget(updatedBudget);

      // Cache locally immediately
      await cacheBudget(user.id, updatedBudget);

      // Close budget screen immediately
      setShowBudgetForm(false);

      // Try syncing with server in the background
      void (async () => {
        try {
          const token = await getAuthToken();

          if (!token) {
            throw new Error("Authentication token is missing");
          }

          const budgetData = await saveBudget(token, updatedBudget);

          const serverBudget = Number(budgetData.budget);

          // Update local state with server value
          setBudget(serverBudget);

          // Keep cache synchronized
          await cacheBudget(user.id, serverBudget);

          // Clear pending budget if one exists
          await clearPendingBudget(user.id);

          console.log("Budget synced successfully");
        } catch (error) {
          console.log("Budget saved locally. Sync pending:", error.message);

          await savePendingBudget(user.id, updatedBudget);
        }
      })();
    } catch (error) {
      console.log("Error saving budget locally:", error.message);
    }
  };
  if (showForm || showBudgetForm) {
    return (
      <FormScreen
        mode={showForm ? "expense" : "budget"}
        isSaving={isSavingTransaction}
        editingTransaction={editingTransaction}
        handleSaveExpense={handleSaveExpense}
        setShowForm={setShowForm}
        setEditingTransactionId={setEditingTransactionId}
        setEditingTransaction={setEditingTransaction}
        budget={budget}
        handleSaveBudget={handleSaveBudget}
        setShowBudgetForm={setShowBudgetForm}
      />
    );
  }

  if (showCurrency) {
    return (
      <CurrencySetupScreen
        onComplete={async () => {
          await completeCurrencySetup(user.id);
          setShowCurrency(false);
        }}
      />
    );
  }

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
      <View
        style={[
          styles.header,
          {
            marginTop: spacing.xxxl,
            marginBottom: spacing.xl,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text
            style={[
              styles.greeting,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            {getGreeting()}, {user?.name || "there"} 👋
          </Text>

          <Text
            style={[
              styles.headerDate,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        <Pressable
          style={[
            styles.menuButton,
            {
              backgroundColor: colors.surfaceSecondary,
            },
          ]}
          onPress={() => setShowMenu(true)}
        >
          <Text
            style={[
              styles.menuButtonText,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            ⋮
          </Text>
        </Pressable>
      </View>
      {/*three dot modal */}
      <ModalComponent
        showMenu={showMenu}
        onExport={handleExportTransactions}
        onPrintReport={handlePrintReport}
        setShowMenu={setShowMenu}
        setShowBudgetForm={setShowBudgetForm}
        handleLogout={handleLogout}
        onAnalytics={() => setShowAnalytics(true)}
      />
      {showAnalytics ? (
        <Analytics
          setShowAnalytics={setShowAnalytics}
          transactions={transactionList}
          budget={budget}
        />
      ) : (
        <>
          {/* Summary Card */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              THIS MONTH
            </Text>

            <Text
              style={[
                styles.summaryAmount,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              {formatAmount(totalSpent)}
            </Text>

            <Text
              style={[
                styles.summarySubtext,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Total spent
            </Text>

            <View
              style={[
                styles.summaryDivider,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text
                  style={[
                    styles.summaryStatLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Budget
                </Text>

                <Text
                  style={[
                    styles.summaryStatAmount,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {formatAmount(budget)}
                </Text>
              </View>

              <View style={[styles.summaryStat, styles.summaryColumnRight]}>
                <Text
                  style={[
                    styles.summaryStatLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {isOverBudget ? "Over Budget" : "Remaining"}
                </Text>

                <Text
                  style={[
                    styles.summaryStatAmount,
                    {
                      color: isOverBudget ? colors.danger : colors.textPrimary,
                    },
                  ]}
                >
                  {formatAmount(isOverBudget ? overBudgetAmount : remaining)}
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
        </>
      )}
    </ScrollView>
  );
}

export default function AppWithTheme() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </ThemeProvider>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },

    contentContainer: {
      paddingBottom: 80,
    },

    // header style
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
    },

    headerContent: {
      flex: 1,
      paddingRight: spacing.md,
    },

    greeting: {
      fontSize: 20,
      fontWeight: "700",
      lineHeight: 28,
      color: colors.textPrimary,
    },

    headerDate: {
      marginTop: spacing.xs,
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      color: colors.textSecondary,
    },

    menuButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceSecondary,
    },

    menuButtonText: {
      fontSize: 30,
      fontWeight: "700",
      lineHeight: 32,
      color: colors.textPrimary,
    },
    // summary card style
    summaryCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 20,
      marginBottom: 16,
    },

    summaryLabel: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,
    },

    summaryAmount: {
      fontSize: 32,
      fontWeight: "700",
      marginTop: 8,
    },

    summarySubtext: {
      fontSize: 14,
      marginTop: 4,
    },

    summaryDivider: {
      height: 1,
      marginVertical: 18,
    },

    summaryStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    summaryStat: {
      flex: 1,
    },

    summaryColumnRight: {
      alignItems: "flex-end",
    },

    summaryStatLabel: {
      fontSize: 13,
      marginBottom: 4,
    },

    summaryStatAmount: {
      fontSize: 17,
      fontWeight: "700",
    },

    addButton: {
      marginTop: spacing.lg,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      alignItems: "center",
    },

    addButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },
  });
