import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIAP } from "expo-iap";

import { useTheme } from "../context/ThemeContext";
import { verifyGoogleSubscription } from "../services/api";
import { getAuthToken } from "../services/authStorage";

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

const PRODUCTS = {
  monthly: "spendwise_pro_monthly",
  yearly: "spendwise_pro_yearly",
};

export default function SpendWiseProScreen({
  onBack,
  onSubscriptionVerified,
  isPro = false,
}) {
  const { colors, spacing, typography, radius } = useTheme();

  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const processedPurchases = useRef(new Set());
  const verificationInProgress = useRef(false);

  const styles = createStyles(colors, spacing, typography, radius);

  const showPurchaseError = useCallback((message) => {
    console.log("message", message);
    Alert.alert("SpendWise Pro", message, [{ text: "OK" }]);
  }, []);

  const handlePurchaseSuccess = useCallback(
    async (purchase) => {
      const productId = purchase.productId;
      const purchaseToken =
        purchase.purchaseTokenAndroid || purchase.purchaseToken;

      const purchaseKey =
        purchaseToken || purchase.transactionId || `${productId}`;

      if (
        verificationInProgress.current ||
        processedPurchases.current.has(purchaseKey)
      ) {
        return;
      }

      if (!productId || !purchaseToken) {
        showPurchaseError(
          "Google Play did not return the required purchase details. Please try again.",
        );
        return;
      }

      verificationInProgress.current = true;
      setIsProcessing(true);

      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Please log in again before upgrading to Pro.");
        }

        await verifyGoogleSubscription(token, productId, purchaseToken);

        // Complete the store transaction only after backend verification succeeds.
        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        processedPurchases.current.add(purchaseKey);

        // Refresh the UI separately. A refresh failure does not mean
        // that Google Play verification failed.
        let refreshFailed = false;

        try {
          if (onSubscriptionVerified) {
            await onSubscriptionVerified();
          }
        } catch (refreshError) {
          refreshFailed = true;
          console.error("Failed to refresh the SpendWise user:", refreshError);
        }

        Alert.alert(
          "SpendWise Pro",
          refreshFailed
            ? "Your subscription has been verified. Reopen SpendWise or sign in again to refresh your Pro status."
            : "Your subscription has been verified and your Pro benefits are ready.",
          [
            {
              text: "OK",
              onPress: onBack,
            },
          ],
        );
      } catch (error) {
        console.error("SpendWise Pro verification failed:", error);

        showPurchaseError(
          error.message ||
            "We couldn't verify your subscription. Your Pro access has not been changed. Please try again.",
        );
      } finally {
        verificationInProgress.current = false;
        setIsProcessing(false);
      }
    },
    [onBack, onSubscriptionVerified, showPurchaseError],
  );

  const handlePurchaseError = useCallback(
    (error) => {
      const code = String(error?.code || "").toLowerCase();

      if (code.includes("cancel") || code.includes("user-cancel")) {
        return;
      }

      console.error("Google Play purchase error:", error);

      showPurchaseError(
        error?.message ||
          "Google Play couldn't start the purchase. Please try again.",
      );
    },
    [showPurchaseError],
  );

  const handleIapError = useCallback((error) => {
    console.warn("Google Play Billing error:", error?.message || error);
  }, []);

  const {
    connected,
    subscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: handlePurchaseError,
    onError: handleIapError,
  });

  useEffect(() => {
    if (!connected) {
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      setIsLoadingProducts(true);

      try {
        await fetchProducts({
          skus: Object.values(PRODUCTS),
          type: "subs",
        });
      } catch (error) {
        console.warn("Unable to load Pro subscriptions:", error?.message);
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [connected, fetchProducts]);

  const plans = [
    {
      id: "monthly",
      productId: PRODUCTS.monthly,
      title: "Monthly",
      fallbackPrice: "â‚¹49",
      period: "/ month",
      detail: "Billed monthly",
    },
    {
      id: "yearly",
      productId: PRODUCTS.yearly,
      title: "Yearly",
      fallbackPrice: "â‚¹499",
      period: "/ year",
      detail: "About â‚¹42 per month",
      badge: "BEST VALUE",
    },
  ];

  const handleUpgrade = async () => {
    if (isProcessing || isLoadingProducts) {
      return;
    }

    if (!connected) {
      showPurchaseError(
        "Google Play Billing isn't connected yet. Please check your internet connection and try again.",
      );
      return;
    }

    const selected = plans.find((plan) => plan.id === selectedPlan);
    const product = subscriptions.find(
      (item) => item.id === selected?.productId,
    );

    if (!selected || !product) {
      showPurchaseError(
        "This subscription isn't available from Google Play yet. Please try again after the subscription products are published for testing.",
      );
      return;
    }

    const offers = (product.subscriptionOffers || []).filter(
      (offer) => offer.basePlanIdAndroid && offer.offerTokenAndroid,
    );

    const matchingBasePlan = offers.find((offer) =>
      selectedPlan === "monthly"
        ? offer.basePlanIdAndroid === "monthly-auto-renew"
        : offer.basePlanIdAndroid === "yearly-annual",
    );

    const chosenOffer = matchingBasePlan || offers[0];

    if (!chosenOffer?.offerTokenAndroid) {
      showPurchaseError(
        "Google Play hasn't returned a valid offer for this plan. Please try again later.",
      );
      return;
    }

    try {
      await requestPurchase({
        type: "subs",
        request: {
          google: {
            skus: [selected.productId],
            subscriptionOffers: [
              {
                sku: selected.productId,
                offerToken: chosenOffer.offerTokenAndroid,
              },
            ],
          },
        },
      });
    } catch (error) {
      handlePurchaseError(error);
    }
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
            <Text style={styles.backText}>‹</Text>
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
                const product = subscriptions.find(
                  (item) => item.id === plan.productId,
                );
                const price = product?.displayPrice || plan.fallbackPrice;

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
                    accessibilityLabel={`${plan.title}, ${price} ${plan.period}`}
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
                      <Text style={styles.planPrice}>{price}</Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>

                    <Text style={styles.planDetail}>{plan.detail}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[
                styles.upgradeButton,
                (isProcessing || isLoadingProducts) &&
                  styles.upgradeButtonDisabled,
              ]}
              onPress={handleUpgrade}
              disabled={isProcessing || isLoadingProducts}
              accessibilityRole="button"
              accessibilityLabel="Continue to SpendWise Pro upgrade"
            >
              {isProcessing || isLoadingProducts ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.upgradeButtonText}>
                  Continue with{" "}
                  {selectedPlan === "yearly" ? "Yearly" : "Monthly"}
                </Text>
              )}
            </Pressable>

            <Text style={styles.disclaimer}>
              Subscriptions are processed by Google Play. Pricing, renewal, and
              cancellation terms are shown during checkout.
            </Text>
          </>
        )}

        {isPro && (
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>You're on Pro</Text>
            <Text style={styles.activeDescription}>
              Enjoy your premium benefits. Your subscription is verified by
              SpendWise.
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
    upgradeButtonDisabled: {
      opacity: 0.7,
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
