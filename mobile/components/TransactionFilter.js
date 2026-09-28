import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { categories } from "../utils/categoryUtils";
import { useTheme } from "../context/ThemeContext";

export default function TransactionFilter({
  searchText,
  setSearchText,
  selectedCategory,
  setSelectedCategory,
}) {
  const { colors, spacing, radius } = useTheme();

  const styles = createStyles(colors, spacing, radius);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search expenses..."
        placeholderTextColor={colors.textMuted}
        value={searchText}
        onChangeText={setSearchText}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        <Pressable
          style={[
            styles.categoryButton,
            selectedCategory === "All" && styles.selectedCategory,
          ]}
          onPress={() => {
            setSearchText("");
            setSelectedCategory("All");
          }}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === "All" && styles.selectedCategoryText,
            ]}
          >
            All
          </Text>
        </Pressable>

        {categories.map((category) => (
          <Pressable
            key={category.name}
            style={[
              styles.categoryButton,
              selectedCategory === category.name && styles.selectedCategory,
            ]}
            onPress={() => {
              setSearchText("");
              setSelectedCategory(category.name);
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name &&
                  styles.selectedCategoryText,
              ]}
            >
              {category.icon} {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.xl,
    },

    searchInput: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },

    categoryContainer: {
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },

    categoryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.round,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },

    selectedCategory: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    categoryText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },

    selectedCategoryText: {
      color: colors.white,
    },
  });
