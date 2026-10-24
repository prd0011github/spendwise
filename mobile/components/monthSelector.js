import react from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function MonthSelector({
  previousMonth,
  nextMonth,
  selectedDate,
  getMonthYear,
}) {
  const { colors, spacing, typography, radius } = useTheme();

  const styles = createStyles(colors, spacing, typography, radius);

  return (
    <>
      <View style={styles.monthSelector}>
        <Pressable
          style={styles.monthButton}
          onPress={previousMonth}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Text style={styles.monthArrow}>‹</Text>
        </Pressable>

        <Text style={styles.monthText}>{getMonthYear(selectedDate)}</Text>

        <Pressable
          style={styles.monthButton}
          onPress={nextMonth}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Text style={styles.monthArrow}>›</Text>
        </Pressable>
      </View>
    </>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    monthSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.lg,
    },

    monthButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
    },

    monthArrow: {
      fontSize: 32,
      lineHeight: 34,
      color: colors.primary,
      fontWeight: "400",
    },

    monthText: {
      ...typography.heading,
      color: colors.textPrimary,
    },
  });
