import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

export default function SettingsScreen({
  onBack,
  onCurrencyPress,
  onThemePress,
}) {
  const { colors, spacing, typography, radius, themeMode } = useTheme();

  const { currencyInfo } = useCurrency();

  const styles = createStyles(colors, spacing, typography, radius);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Settings</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.section}>
          <Pressable
            style={styles.settingRow}
            onPress={onCurrencyPress}
            accessibilityRole="button"
            accessibilityLabel={`Currency, currently ${currencyInfo.name}`}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>💱</Text>
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Currency</Text>

              <Text style={styles.settingSubtitle}>
                {currencyInfo.name} ({currencyInfo.symbol})
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.settingRow}
            onPress={onThemePress}
            accessibilityRole="button"
            accessibilityLabel={`Theme, currently ${themeMode}`}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>🎨</Text>
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Theme</Text>

              <Text style={styles.settingSubtitle}>
                {themeMode === "system"
                  ? "System default"
                  : themeMode === "dark"
                    ? "Dark"
                    : "Light"}
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {/* Coming soon */}
        <Text style={styles.sectionTitle}>More</Text>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>🔔</Text>
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>

              <Text style={styles.settingSubtitle}>Coming soon</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>👤</Text>
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Account</Text>

              <Text style={styles.settingSubtitle}>Coming soon</Text>
            </View>
          </View>
        </View>
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
      backgroundColor: colors.background,
      padding: spacing.lg,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xxl,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    backButtonText: {
      color: colors.primary,
      fontSize: 32,
      lineHeight: 34,
      fontWeight: "400",
    },

    title: {
      flex: 1,
      textAlign: "center",
      color: colors.textPrimary,
      ...typography.heading,
    },

    headerSpacer: {
      width: 44,
    },

    sectionTitle: {
      color: colors.textSecondary,
      ...typography.caption,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },

    section: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.xxl,
      overflow: "hidden",
    },

    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      minHeight: 72,
    },

    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },

    settingIconText: {
      fontSize: 20,
    },

    settingContent: {
      flex: 1,
    },

    settingTitle: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
    },

    settingSubtitle: {
      color: colors.textSecondary,
      ...typography.caption,
      marginTop: spacing.xs,
    },

    chevron: {
      color: colors.textMuted,
      fontSize: 28,
      fontWeight: "300",
      marginLeft: spacing.sm,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 68,
    },
  });
