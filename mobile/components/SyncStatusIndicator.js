import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";

export default function SyncStatusIndicator({ status = "synced" }) {
  const { colors, spacing, typography, radius } = useTheme();

  const styles = createStyles(colors, spacing, typography, radius);

  const statusConfig = {
    synced: {
      icon: "✓",
      label: "Synced",
      color: colors.success,
      backgroundColor: colors.successLight,
    },

    syncing: {
      icon: "↻",
      label: "Syncing...",
      color: colors.primary,
      backgroundColor: colors.primaryLight,
    },

    pending: {
      icon: "!",
      label: "Sync pending",
      color: colors.warning,
      backgroundColor: colors.warningLight,
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.synced;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentStatus.backgroundColor,
        },
      ]}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={currentStatus.label}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: currentStatus.color,
          },
        ]}
      >
        <Text style={styles.icon}>{currentStatus.icon}</Text>
      </View>

      <Text
        style={[
          styles.label,
          {
            color: currentStatus.color,
          },
        ]}
      >
        {currentStatus.label}
      </Text>
    </View>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.round,
    },

    iconContainer: {
      width: 18,
      height: 18,
      borderRadius: radius.round,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.xs,
    },

    icon: {
      color: colors.white,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 14,
    },

    label: {
      ...typography.caption,
      fontWeight: "600",
    },
  });
