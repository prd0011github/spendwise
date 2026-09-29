import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import categoryIcons from "../utils/categoryUtils";
import { useTheme } from "../context/ThemeContext";

const categories = Object.keys(categoryIcons).map((name) => ({
  name,
  icon: categoryIcons[name],
}));

export default function ExpenseForm({
  visible,
  editingTransaction,
  isSaving,
  onSave,
  onCancel,
}) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

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
    if (isSaving) {
      return;
    }

    const amount = Number(expenseAmount);

    if (!expenseName.trim()) {
      setError("Please enter an expense name");
      return;
    }

    if (!expenseAmount || amount <= 0) {
      setError("Please enter a valid amount");
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
        placeholderTextColor={colors.textMuted}
        value={expenseName}
        onChangeText={(value) => {
          setExpenseName(value);
          setError("");
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        placeholderTextColor={colors.textMuted}
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

      <Pressable
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Update Expense"
              : "Save Expense"}
        </Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    form: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.xl,
      marginTop: spacing.xl,
    },

    formTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      color: colors.textPrimary,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 16,
      marginBottom: spacing.md,
    },

    categoryLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },

    categoryList: {
      marginBottom: spacing.md,
    },

    categoryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginRight: spacing.sm,
      alignItems: "center",
    },

    categoryButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    categoryIcon: {
      fontSize: 20,
    },

    categoryOptionText: {
      fontSize: 12,
      marginTop: spacing.xs,
      color: colors.textSecondary,
    },

    categoryOptionTextSelected: {
      color: colors.white,
      fontWeight: "600",
    },

    saveButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: radius.md,
      alignItems: "center",
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },

    cancelButton: {
      padding: spacing.md,
      alignItems: "center",
    },

    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
    },

    error: {
      color: colors.danger,
      fontSize: 14,
      marginBottom: spacing.md,
    },
  });
