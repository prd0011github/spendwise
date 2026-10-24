export const PRO_FEATURES = {
  ADVANCED_ANALYTICS: "advancedAnalytics",
  CUSTOM_CATEGORIES: "customCategories",
  REPORT_EXPORTS: "reportExports",
  PERSONALIZED_THEMES: "personalizedThemes",
};

export const isProUser = (user) => {
  if (!user?.subscription) {
    return false;
  }

  const { plan, status, expiresAt } = user.subscription;

  if (plan !== "pro" || status !== "active") {
    return false;
  }

  // If an expiry date exists, it must still be in the future.
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    return false;
  }

  return true;
};

export const canAccessProFeature = (user, feature) => {
  const proOnlyFeatures = Object.values(PRO_FEATURES);

  if (!proOnlyFeatures.includes(feature)) {
    return true;
  }

  return isProUser(user);
};
