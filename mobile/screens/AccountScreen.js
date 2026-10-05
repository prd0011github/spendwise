import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import { getAuthUser } from "../services/authStorage";

export default function AccountScreen({
  onBack,
  onLogout,
  onChangePassword,
  onDeleteAccount,
}) {
  const { colors, spacing, typography, radius } = useTheme();

  const [user, setUser] = React.useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getAuthUser();
      setUser(storedUser);
    };

    void loadUser();
  }, []);

  const styles = createStyles(colors, spacing, typography, radius);

  return (
    <>
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

            <Text style={styles.title}>Account</Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* Profile */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>

            <Text style={styles.name}>{user?.name || "User"}</Text>

            <Text style={styles.email}>
              {user?.email || "No email available"}
            </Text>
          </View>

          {/* Profile */}
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>

              <Text style={styles.value}>{user?.name || "Not available"}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>

              <Text style={styles.value}>{user?.email || "Not available"}</Text>
            </View>
          </View>

          {/* Security */}
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.section}>
            <Pressable
              style={styles.settingRow}
              onPress={onChangePassword}
              accessibilityRole="button"
              accessibilityLabel="Change password"
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Change Password</Text>

                <Text style={styles.settingSubtitle}>
                  Update your account password
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          {/* Account */}
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.section}>
            <Pressable
              style={styles.settingRow}
              onPress={onLogout}
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Logout</Text>

                <Text style={styles.settingSubtitle}>
                  Sign out of your SpendWise account
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.settingRow}
              onPress={() => setShowDeleteConfirmation(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete account"
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.danger }]}>
                  Delete Account
                </Text>

                <Text style={styles.settingSubtitle}>
                  Permanently delete your account
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <Modal
        visible={showDeleteConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Account?</Text>

            <Text style={styles.modalMessage}>
              This will permanently delete your account, transactions, and
              budget data. This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.deleteButton,
                  isDeleting && styles.buttonDisabled,
                ]}
                disabled={isDeleting}
                onPress={async () => {
                  setIsDeleting(true);

                  try {
                    await onDeleteAccount();
                    setShowDeleteConfirmation(false);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                <Text style={styles.deleteButtonText}>
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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

    profileCard: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.xl,
      marginBottom: spacing.xxl,
    },

    avatar: {
      width: 72,
      height: 72,
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },

    avatarText: {
      color: colors.primary,
      fontSize: 30,
      fontWeight: "700",
    },

    name: {
      color: colors.textPrimary,
      ...typography.heading,
    },

    email: {
      color: colors.textSecondary,
      ...typography.caption,
      marginTop: spacing.xs,
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

    infoRow: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },

    label: {
      color: colors.textSecondary,
      ...typography.caption,
    },

    value: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
      marginTop: spacing.xs,
    },

    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      minHeight: 72,
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
      marginLeft: spacing.lg,
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },

    modalContainer: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xl,
    },

    modalTitle: {
      color: colors.textPrimary,
      ...typography.heading,
    },

    modalMessage: {
      color: colors.textSecondary,
      ...typography.body,
      lineHeight: 22,
      marginTop: spacing.md,
    },

    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: spacing.md,
      marginTop: spacing.xl,
    },

    cancelButton: {
      minHeight: 44,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },

    cancelButtonText: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
    },

    deleteButton: {
      minHeight: 44,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.danger,
    },

    buttonDisabled: {
      opacity: 0.6,
    },

    deleteButtonText: {
      color: "#FFFFFF",
      ...typography.bodyMedium,
      fontWeight: "700",
    },
  });
