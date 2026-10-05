import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { changePassword } from "../services/api";
import { getAuthToken } from "../services/authStorage";

import { useTheme } from "../context/ThemeContext";

export default function ChangePasswordScreen({ onBack }) {
  const { colors, spacing, typography, radius } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const styles = createStyles(colors, spacing, typography, radius);

  const handleChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "New password must be different from your current password.",
      );
      return;
    }

    try {
      setIsSaving(true);

      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      await changePassword(token, currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage("Password changed successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

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

          <Text style={styles.title}>Change Password</Text>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.description}>
          Enter your current password and choose a new password for your
          SpendWise account.
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Current Password</Text>

            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>

            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm New Password</Text>

            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          {successMessage ? (
            <Text style={styles.successMessage}>{successMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.button, isSaving && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Change password"
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Changing Password..." : "Change Password"}
            </Text>
          </Pressable>
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

    backButtonText: {
      color: colors.primary,
      fontSize: 32,
      lineHeight: 34,
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

    description: {
      color: colors.textSecondary,
      ...typography.body,
      lineHeight: 22,
      marginBottom: spacing.xl,
    },

    form: {
      gap: spacing.lg,
    },

    field: {
      gap: spacing.sm,
    },

    label: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
    },

    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      fontSize: 16,
    },

    button: {
      minHeight: 52,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
    },

    buttonText: {
      color: "#FFFFFF",
      ...typography.bodyMedium,
      fontWeight: "700",
    },

    errorMessage: {
      color: colors.danger,
      ...typography.caption,
    },

    successMessage: {
      color: colors.success,
      ...typography.caption,
    },

    buttonDisabled: {
      opacity: 0.6,
    },
  });
