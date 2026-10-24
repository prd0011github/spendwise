import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";

const CATEGORY_ICONS = [
  "🏷️",
  "🐶",
  "👶",
  "💊",
  "🎓",
  "✈️",
  "🏋️",
  "🎁",
  "💻",
  "🌱",
  "💰",
  "📱",
];

export default function ManageCategoriesScreen({
  onBack,
  isPro = false,
  customCategories = [],
  defaultCategories = [],
  onSaveCategories,
  onUpgradePress,
}) {
  const { colors, spacing, typography, radius } = useTheme();

  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const styles = createStyles(colors, spacing, typography, radius);

  const handleAddCategory = async () => {
    if (!isPro) {
      onUpgradePress?.();
      return;
    }

    const name = categoryName.trim();

    if (!name) {
      Alert.alert("Category name required", "Enter a name for your category.");
      return;
    }

    const allNames = [...defaultCategories, ...customCategories].map(
      (category) => category.name.toLowerCase(),
    );

    if (allNames.includes(name.toLowerCase())) {
      Alert.alert(
        "Category already exists",
        "Choose a different name. Category names must be unique.",
      );
      return;
    }

    const updatedCategories = [
      ...customCategories,
      { name, icon: selectedIcon },
    ];

    setIsSaving(true);
    Keyboard.dismiss();

    try {
      const saved = await onSaveCategories?.(updatedCategories);

      if (!saved) {
        Alert.alert("Couldn't save category", "Please try again.");
        return;
      }

      setCategoryName("");
      setSelectedIcon(CATEGORY_ICONS[0]);
    } catch (error) {
      Alert.alert("Error", "Something went wrong while saving the category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (category) => {
    if (!isPro) {
      onUpgradePress?.();
      return;
    }

    Alert.alert(
      "Remove category?",
      `"${category.name}" will no longer be available for new transactions. Existing transactions will not be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);

            try {
              const updatedCategories = customCategories.filter(
                (item) => item.name !== category.name,
              );

              const saved = await onSaveCategories?.(updatedCategories);

              if (!saved) {
                Alert.alert("Couldn't remove category", "Please try again.");
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "Something went wrong while removing the category.",
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
    );
  };

  if (!isPro) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>Custom Categories</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.lockedCard}>
            <Text style={styles.lockedIcon}>🔒</Text>
            <Text style={styles.lockedTitle}>A Pro feature</Text>
            <Text style={styles.description}>
              Create personalized expense categories with your own names and
              icons when you upgrade to SpendWise Pro.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={onUpgradePress}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                Explore SpendWise Pro
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Custom Categories</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.description}>
            Personalize your expenses by creating categories that fit your
            lifestyle.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create a category</Text>

            <Text style={styles.label}>Category name</Text>
            <TextInput
              style={styles.input}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="e.g. Pet care"
              placeholderTextColor={colors.textMuted}
              maxLength={30}
              editable={!isSaving}
              returnKeyType="done"
              onSubmitEditing={handleAddCategory}
              accessibilityLabel="New category name"
            />

            <Text style={styles.label}>Choose an icon</Text>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map((icon) => {
                const selected = selectedIcon === icon;

                return (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      selected && styles.selectedIconOption,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Choose ${icon} icon`}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.primaryButton, isSaving && styles.disabledButton]}
              onPress={handleAddCategory}
              disabled={isSaving}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Saving..." : "Add category"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Your custom categories ({customCategories.length})
          </Text>

          <View style={styles.card}>
            {customCategories.length === 0 ? (
              <Text style={styles.emptyText}>
                No custom categories yet. Create your first one above.
              </Text>
            ) : (
              customCategories.map((category, index) => (
                <View key={category.name} style={styles.categoryRow}>
                  <View style={styles.categoryIcon}>
                    <Text style={styles.iconText}>{category.icon || "🏷️"}</Text>
                  </View>

                  <Text style={styles.categoryName}>{category.name}</Text>

                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleDeleteCategory(category)}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${category.name}`}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>

          <Text style={styles.note}>
            Default categories cannot be removed. Removing a custom category
            does not delete existing transactions.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: spacing.xxl,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    backText: {
      color: colors.primary,
      fontSize: 32,
      lineHeight: 36,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: colors.textPrimary,
      ...typography.heading,
    },
    headerSpacer: {
      width: 44,
    },
    description: {
      color: colors.textSecondary,
      ...typography.body,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
      marginBottom: spacing.md,
    },
    label: {
      color: colors.textSecondary,
      ...typography.caption,
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    iconGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    iconOption: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedIconOption: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primaryLight,
    },
    iconText: {
      fontSize: 22,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    disabledButton: {
      opacity: 0.6,
    },
    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    categoryName: {
      flex: 1,
      color: colors.textPrimary,
      ...typography.bodyMedium,
    },
    removeButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    removeText: {
      color: colors.danger || "#D92D20",
      fontWeight: "600",
    },
    emptyText: {
      color: colors.textSecondary,
      ...typography.body,
      lineHeight: 22,
    },
    note: {
      color: colors.textMuted,
      ...typography.caption,
      lineHeight: 19,
      marginBottom: spacing.lg,
    },
    lockedCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.xl,
      alignItems: "center",
    },
    lockedIcon: {
      fontSize: 36,
      marginBottom: spacing.md,
    },
    lockedTitle: {
      color: colors.textPrimary,
      ...typography.heading,
      marginBottom: spacing.sm,
    },
  });
