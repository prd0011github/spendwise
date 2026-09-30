import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import CurrencySelector from "../components/CurrencySelector";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";

export default function CurrencySetupScreen({ onComplete }) {
  const { setCurrency, completeCurrencySetup } = useCurrency();

  const { colors, spacing, typography, radius } = useTheme();

  const styles = createStyles(colors, spacing, typography, radius);

  const handleSelect = async (currencyCode) => {
    await setCurrency(currencyCode);
  };

  const handleContinue = async () => {
    await completeCurrencySetup();
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.selectorContainer}>
        <CurrencySelector onSelect={handleSelect} />
      </View>

      <Pressable
        style={styles.continueButton}
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },

    selectorContainer: {
      flex: 1,
    },

    continueButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: "center",
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },

    continueButtonText: {
      ...typography.bodyMedium,
      color: colors.white,
    },
  });
