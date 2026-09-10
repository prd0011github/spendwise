import { Pressable, StyleSheet, Text, Alert, View } from "react-native";
import categoryIcons from "../utils/categoryUtils";

export default function TransactionItem({
  transactionList,
  setTransactionList,
  setEditingTransactionId,
  setEditingTransaction,
  setShowForm,
}) {
  const getCategoryIcon = (categoryName) =>
    categoryIcons[categoryName] || categoryIcons.Other;

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
          onPress: () => {
            setTransactionList((currentTransactions) =>
              currentTransactions.filter(
                (transaction) => transaction.id !== id,
              ),
            );
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
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      {transactionList.map((transaction) => (
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
              {transaction.category || "Other"}
            </Text>
          </View>

          <Text style={styles.expense}>
            -₹{transaction.amount.toLocaleString()}
          </Text>
        </Pressable>
      ))}
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
});
