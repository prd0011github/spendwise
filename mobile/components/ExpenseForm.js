import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const categoryIcons = {
  Food: "🍔",
  Shopping: "🛒",
  Transport: "🚕",
  Bills: "🏠",
  Entertainment: "🎬",
  Other: "📦",
};

const categories = Object.keys(categoryIcons).map((name) => ({
  name,
  icon: categoryIcons[name],
}));

export default function ExpenseForm({
  visible,
  editingTransaction,
  remaining,
  onSave,
  onCancel,
}) {
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Other");
  const [error, setError] = useState("");

  const isEditing = Boolean(editingTransaction);

  useEffect(() => {
    if (editingTransaction) {
      setExpenseName(editingTransaction.name);
      setExpenseAmount(String(editingTransaction.amount));
      setExpenseCategory(editingTransaction.category || "Other");
    } else {
      setExpenseName("");
      setExpenseAmount("");
      setExpenseCategory("Other");
    }

    setError("");
  }, [editingTransaction, visible]);

  if (!visible) {
    return null;
  }

  const handleSave = () => {
    const amount = Number(expenseAmount);

    if (!expenseName.trim()) {
      setError("Please enter an expense name");
      return;
    }

    if (!expenseAmount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    let availableBudget = remaining;

    if (editingTransaction) {
      availableBudget += editingTransaction.amount;
    }

    if (amount > availableBudget) {
      setError("Expense exceeds your remaining budget");
      return;
    }

    onSave({
      name: expenseName.trim(),
      amount,
      category: expenseCategory,
    });
  };

  const handleCancel = () => {
    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("Other");
    setError("");
    onCancel();
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>
        {isEditing ? "Edit Expense" : "Add Expense"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Expense name"
        value={expenseName}
        onChangeText={(value) => {
          setExpenseName(value);
          setError("");
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={expenseAmount}
        onChangeText={(value) => {
          setExpenseAmount(value);
          setError("");
        }}
      />

      <Text style={styles.categoryLabel}>Category</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      >
        {categories.map((category) => (
          <Pressable
            key={category.name}
            style={[
              styles.categoryButton,
              expenseCategory === category.name &&
                styles.categoryButtonSelected,
            ]}
            onPress={() => {
              setExpenseCategory(category.name);
              setError("");
            }}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>

            <Text
              style={[
                styles.categoryOptionText,
                expenseCategory === category.name &&
                  styles.categoryOptionTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isEditing ? "Update Expense" : "Save Expense"}
        </Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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

  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  categoryList: {
    marginBottom: 15,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    alignItems: "center",
  },

  categoryButtonSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },

  categoryIcon: {
    fontSize: 20,
  },

  categoryOptionText: {
    fontSize: 12,
    marginTop: 4,
    color: "#334155",
  },

  categoryOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
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
