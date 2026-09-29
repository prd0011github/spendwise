import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import BudgetForm from "../components/BudgetForm";
import ExpenseForm from "../components/ExpenseForm";
import { useTheme } from "../context/ThemeContext";

export default function FormScreen(props) {
  const {
    mode,
    editingTransaction,
    isSaving,
    handleSaveExpense,
    setShowForm,
    setEditingTransactionId,
    setEditingTransaction,
    budget,
    handleSaveBudget,
    setShowBudgetForm,
  } = props;

  const { colors, spacing, typography, radius } = useTheme();
  const styles = createStyles(colors, spacing, typography, radius);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (mode === "budget") {
              setShowBudgetForm(false);
            } else {
              setShowForm(false);
              setEditingTransactionId(null);
              setEditingTransaction(null);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.title}>
          {editingTransaction
            ? "Edit Expense"
            : mode === "expense"
              ? "Add Expense"
              : "Set Budget"}
        </Text>
      </View>
      {mode === "expense" && (
        <ExpenseForm
          visible={true}
          isSaving={isSaving}
          editingTransaction={editingTransaction}
          onSave={(expense) => handleSaveExpense(expense)}
          onCancel={() => {
            setShowForm(false);
            setEditingTransactionId(null);
            setEditingTransaction(null);
          }}
        />
      )}

      {mode === "budget" && (
        <BudgetForm
          budget={budget}
          onSave={(newBudget) => handleSaveBudget(newBudget)}
          onCancel={() => {
            setShowBudgetForm(false);
          }}
        />
      )}
    </View>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.xxxl,
      marginBottom: spacing.lg,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },

    backButtonText: {
      fontSize: 32,
      lineHeight: 34,
      color: colors.primary,
      fontWeight: "400",
    },

    title: {
      ...typography.title,
      color: colors.textPrimary,
    },
  });
