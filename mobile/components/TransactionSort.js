import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest", value: "highest" },
  { label: "Lowest", value: "lowest" },
];

export default function TransactionSort({ selectedSort, setSelectedSort }) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sort By</Text>

      <View style={styles.options}>
        {sortOptions.map((option) => {
          const isSelected = selectedSort === option.value;

          return (
            <Pressable
              key={option.value}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => setSelectedSort(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.md,
    },

    title: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },

    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    option: {
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      borderWidth: 1,
      borderColor: colors.border,
    },

    selectedOption: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    optionText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "600",
    },

    selectedOptionText: {
      color: colors.white,
    },
  });
