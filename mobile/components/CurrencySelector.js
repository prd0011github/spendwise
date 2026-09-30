import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { currencies } from "../utils/currency";

export default function CurrencySelector({ onSelect, compact = false }) {
  const { colors, spacing, typography, radius } = useTheme();
  const { currency } = useCurrency();

  const styles = createStyles(colors, spacing, typography, radius);

  const handleSelect = async (currencyCode) => {
    await onSelect(currencyCode);
  };

  return (
    <View style={styles.container}>
      {!compact && (
        <>
          <Text style={styles.title}>Choose your currency</Text>

          <Text style={styles.subtitle}>
            Select the currency you want SpendWise to use for your budgets,
            expenses and reports.
          </Text>
        </>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {currencies.map((item) => {
          const isSelected = currency === item.code;

          return (
            <Pressable
              key={item.code}
              style={[styles.currencyItem, isSelected && styles.selectedItem]}
              onPress={() => handleSelect(item.code)}
              accessibilityRole="radio"
              accessibilityState={{
                selected: isSelected,
              }}
              accessibilityLabel={`${item.name}, ${item.code}`}
            >
              <View style={styles.currencySymbol}>
                <Text style={styles.symbolText}>{item.symbol}</Text>
              </View>

              <View style={styles.currencyInfo}>
                <Text style={styles.currencyName}>{item.name}</Text>

                <Text style={styles.currencyCode}>{item.code}</Text>
              </View>

              {isSelected && (
                <View style={styles.checkContainer}>
                  <Text style={styles.check}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    title: {
      ...typography.title,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },

    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: spacing.xl,
    },

    list: {
      paddingBottom: spacing.xl,
    },

    currencyItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    selectedItem: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },

    currencySymbol: {
      width: 44,
      height: 44,
      borderRadius: radius.round,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },

    symbolText: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.primary,
    },

    currencyInfo: {
      flex: 1,
    },

    currencyName: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      marginBottom: 2,
    },

    currencyCode: {
      ...typography.caption,
      color: colors.textSecondary,
    },

    checkContainer: {
      width: 28,
      height: 28,
      borderRadius: radius.round,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    check: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },
  });
