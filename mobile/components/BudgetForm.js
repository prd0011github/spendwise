import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function BudgetForm({ budget, totalSpent, onSave, onCancel }) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

  const [budgetInput, setBudgetInput] = useState(String(budget));
  const [budgetError, setBudgetError] = useState("");

  useEffect(() => {
    setBudgetInput(String(budget));
    setBudgetError("");
  }, [budget]);

  const handleSave = () => {
    const newBudget = Number(budgetInput);

    if (!budgetInput || newBudget <= 0) {
      setBudgetError("Please enter a valid budget");
      return;
    }

    if (newBudget < totalSpent) {
      setBudgetError("Budget cannot be less than your total spent");
      return;
    }

    onSave(newBudget);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Monthly Budget</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter monthly budget"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={budgetInput}
        onChangeText={(value) => {
          setBudgetInput(value);
          setBudgetError("");
        }}
      />

      {budgetError ? <Text style={styles.error}>{budgetError}</Text> : null}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Budget</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={onCancel}>
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

    saveButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: radius.md,
      alignItems: "center",
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
