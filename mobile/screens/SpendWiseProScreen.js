import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";

const PRO_FEATURES = [
  {
    title: "Advanced analytics",
    description: "Understand spending trends across months and categories.",
  },
  {
    title: "Custom categories",
    description: "Personalize your expense categories and colors.",
  },
  {
    title: "Reports and exports",
    description: "Export your financial reports for easier tracking.",
  },
  {
    title: "Personalized themes",
    description: "Make your dashboard feel more like yours.",
  },
];

export default function SpendWiseProScreen({ onBack, isPro = false }) {
  const { colors, spacing, typography, radius } = useTheme();

  const [selectedPlan, setSelectedPlan] = useState("yearly");

  const styles = createStyles(colors, spacing, typography, radius);

  const plans = [
    {
      id: "monthly",
      title: "Monthly",
      price: "₹99",
      period: "/ month",
      detail: "Billed monthly",
    },
    {
      id: "yearly",
      title: "Yearly",
      price: "₹799",
      period: "/ year",
      detail: "About ₹67 per month",
      badge: "BEST VALUE",
    },
  ];

  const handleUpgrade = () => {
    Alert.alert(
      "Coming soon",
      "SpendWise Pro payments are not available yet. Your current plan has not been changed.",
      [{ text: "OK" }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>{"‹"}</Text>
          </Pressable>

          <Text style={styles.headerTitle}>SpendWise Pro</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.crown}>
            <Text style={styles.crownText}>PRO</Text>
          </View>

          <Text style={styles.heroTitle}>Make every rupee{"\n"}count.</Text>

          <Text style={styles.heroDescription}>
            Get more insights into your spending and take control of your
            financial goals.
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {isPro ? "YOUR PRO MEMBERSHIP" : "YOUR MONEY, YOUR CONTROL"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {isPro ? "Your Pro benefits" : "Unlock more with Pro"}
        </Text>

        <View style={styles.featuresCard}>
          {PRO_FEATURES.map((feature, index) => (
            <View key={feature.title}>
              <View style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>

                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>

              {index < PRO_FEATURES.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        {!isPro && (
          <>
            <Text style={styles.sectionTitle}>Choose your plan</Text>

            <View style={styles.plansContainer}>
              {plans.map((plan) => {
                const selected = selectedPlan === plan.id;

                return (
                  <Pressable
                    key={plan.id}
                    style={[
                      styles.planCard,
                      selected && styles.selectedPlanCard,
                    ]}
                    onPress={() => setSelectedPlan(plan.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${plan.title}, ${plan.price} ${plan.period}`}
                  >
                    <View style={styles.planTopRow}>
                      <View
                        style={[
                          styles.radioOuter,
                          selected && styles.radioOuterSelected,
                        ]}
                      >
                        {selected && <View style={styles.radioInner} />}
                      </View>

                      <View style={styles.planNameContainer}>
                        <Text style={styles.planTitle}>{plan.title}</Text>
                        {plan.badge && (
                          <Text style={styles.planBadge}>{plan.badge}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>

                    <Text style={styles.planDetail}>{plan.detail}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              accessibilityRole="button"
              accessibilityLabel="Continue to SpendWise Pro upgrade"
            >
              <Text style={styles.upgradeButtonText}>
                Continue with {selectedPlan === "yearly" ? "Yearly" : "Monthly"}
              </Text>
            </Pressable>

            <Text style={styles.disclaimer}>
              Preview pricing only. No payment will be taken. Subscription terms
              and billing will be available when Pro launches.
            </Text>
          </>
        )}

        {isPro && (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>You're on Pro</Text>
            <Text style={styles.activeDescription}>
              Enjoy your premium benefits. Subscription management will be
              available when billing is integrated.
            </Text>
          </View>
        )}

        <Pressable
          style={styles.backLink}
          onPress={onBack}
          accessibilityRole="button"
        >
          <Text style={styles.backLinkText}>Back to SpendWise</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, typography, radius) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
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
    hero: {
      backgroundColor: colors.primary,
      borderRadius: radius.xl || radius.lg,
      padding: spacing.xl,
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    crown: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.round,
      backgroundColor: "rgba(255,255,255,0.18)",
      marginBottom: spacing.md,
    },
    crownText: {
      color: "#FFFFFF",
      fontWeight: "800",
      letterSpacing: 2,
    },
    heroTitle: {
      color: "#FFFFFF",
      fontSize: 30,
      fontWeight: "800",
      textAlign: "center",
      lineHeight: 36,
    },
    heroDescription: {
      color: "#FFFFFF",
      opacity: 0.92,
      textAlign: "center",
      lineHeight: 22,
      marginTop: spacing.md,
    },
    statusBadge: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: "rgba(255,255,255,0.16)",
      borderRadius: radius.round,
    },
    statusText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    sectionTitle: {
      color: colors.textPrimary,
      ...typography.heading,
      marginBottom: spacing.md,
    },
    featuresCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: spacing.lg,
    },
    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: radius.round,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    checkText: {
      color: colors.primary,
      fontSize: 17,
      fontWeight: "800",
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
    },
    featureDescription: {
      color: colors.textSecondary,
      ...typography.caption,
      lineHeight: 19,
      marginTop: spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    plansContainer: {
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    selectedPlanCard: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    planTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: radius.round,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    radioOuterSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: radius.round,
      backgroundColor: colors.primary,
    },
    planNameContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    planTitle: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
    },
    planBadge: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: spacing.md,
    },
    planPrice: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: "800",
    },
    planPeriod: {
      color: colors.textSecondary,
      marginLeft: spacing.xs,
      ...typography.caption,
    },
    planDetail: {
      color: colors.textSecondary,
      ...typography.caption,
      marginTop: spacing.xs,
    },
    upgradeButton: {
      backgroundColor: colors.primary,
      minHeight: 54,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    upgradeButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },
    disclaimer: {
      color: colors.textMuted,
      ...typography.caption,
      textAlign: "center",
      lineHeight: 18,
      marginTop: spacing.md,
    },
    activeCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    activeTitle: {
      color: colors.textPrimary,
      ...typography.bodyMedium,
    },
    activeDescription: {
      color: colors.textSecondary,
      ...typography.caption,
      lineHeight: 20,
      marginTop: spacing.sm,
    },
    backLink: {
      alignItems: "center",
      paddingVertical: spacing.lg,
    },
    backLinkText: {
      color: colors.primary,
      fontWeight: "700",
    },
  });
