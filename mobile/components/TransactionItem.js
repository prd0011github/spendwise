import { Pressable, StyleSheet, Text, Alert, View } from "react-native";
import { getCategoryIcon } from "../utils/categoryUtils";
import { formatTransactionDate } from "../utils/dateUtils";
import {
  removeTransaction,
  addPendingTransactionDelete,
} from "../services/transactionService";
import { getAuthToken, getAuthUser } from "../services/authStorage";
import { useTheme } from "../context/ThemeContext";

export default function TransactionItem({
  displayedTransactions,
  totalDisplayedTransactions,
  showAllTransactions,
  setShowAllTransactions,
  setTransactionList,
  setEditingTransactionId,
  setEditingTransaction,
  setShowForm,
}) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

  const handleDeleteTransaction = (id) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setTransactionList((currentTransactions) =>
              currentTransactions.filter(
                (transaction) => transaction.id !== id,
              ),
            );

            try {
              const token = await getAuthToken();

              if (!token) {
                throw new Error("Authentication token is missing");
              }

              await removeTransaction(token, id);

              console.log("Transaction deleted successfully");
            } catch (error) {
              console.log(
                "Server unavailable. Saving delete locally:",
                error.message,
              );

              const currentUser = await getAuthUser();

              if (!currentUser?.id) {
                console.log(
                  "Unable to save pending delete: user is not available",
                );
                return;
              }

              await addPendingTransactionDelete(currentUser.id, id);

              console.log("Delete operation added to pending queue");
            }
          },
        },
      ],
    );
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Recent Transactions ({totalDisplayedTransactions})
      </Text>

      {displayedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>

          <Text style={styles.emptyTitle}>No transactions found</Text>

          <Text style={styles.emptyText}>
            Try changing your search or category filter.
          </Text>
        </View>
      ) : (
        displayedTransactions.map((transaction) => (
          <Pressable
            key={transaction.id}
            style={styles.transaction}
            onPress={() => handleEditTransaction(transaction)}
            onLongPress={() => handleDeleteTransaction(transaction.id)}
          >
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionName}>
                {getCategoryIcon(transaction.category)} {transaction.name}
              </Text>

              <Text style={styles.categoryText}>
                {transaction.category || "Other"} •{" "}
                {formatTransactionDate(transaction.date)}
              </Text>
            </View>

            <Text style={styles.expense}>
              -₹{transaction.amount.toLocaleString()}
            </Text>
          </Pressable>
        ))
      )}

      {totalDisplayedTransactions > 5 && (
        <Pressable
          style={styles.viewAllButton}
          onPress={() => setShowAllTransactions(!showAllTransactions)}
        >
          <Text style={styles.viewAllText}>
            {showAllTransactions ? "Show Less" : "View All"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: spacing.xxl,
      marginBottom: spacing.md,
    },

    emptyContainer: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.xxxl,
      alignItems: "center",
    },

    emptyIcon: {
      fontSize: 30,
      marginBottom: spacing.sm,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },

    transaction: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      padding: spacing.lg,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    transactionName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },

    transactionInfo: {
      flex: 1,
      paddingRight: spacing.md,
    },

    expense: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.danger,
    },

    categoryText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },

    viewAllButton: {
      alignItems: "center",
      paddingVertical: spacing.md,
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },

    viewAllText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primary,
    },
  });
