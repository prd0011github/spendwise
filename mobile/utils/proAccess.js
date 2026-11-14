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

  // Require a valid expiry date that is still in the future.
  if (!expiresAt) {
    return false;
  }

  const expiryTimestamp = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiryTimestamp) || expiryTimestamp <= Date.now()) {
    return false;
  }

  return true;
};

export const canAccessProFeature = (user, feature) => {
  const proOnlyFeatures = Object.values(PRO_FEATURES);

  // Unknown feature identifiers must never grant access.
  if (!proOnlyFeatures.includes(feature)) {
    return false;
  }

  return isProUser(user);
};
