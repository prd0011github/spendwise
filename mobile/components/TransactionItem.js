import { Pressable, StyleSheet, Text, Alert, View } from "react-native";
import { getCategoryIcon } from "../utils/categoryUtils";
import { formatTransactionDate } from "../utils/dateUtils";
import { removeTransaction } from "../services/transactionService";
import { getAuthToken } from "../services/authStorage";

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
            try {
              const token = await getAuthToken();

              if (!token) {
                console.log("Authentication token is missing");
                return;
              }

              await removeTransaction(token, id);

              setTransactionList((currentTransactions) =>
                currentTransactions.filter(
                  (transaction) => transaction.id !== id,
                ),
              );
            } catch (error) {
              console.log("Error deleting transaction:", error.message);

              return;
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

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 15,
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 30,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
    textAlign: "center",
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

  transactionInfo: {
    flex: 1,
  },

  expense: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 5,
    marginBottom: 10,
  },

  viewAllText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
});
