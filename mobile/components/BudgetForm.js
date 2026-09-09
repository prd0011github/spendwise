import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function BudgetForm({ budget, totalSpent, onSave, onCancel }) {
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
