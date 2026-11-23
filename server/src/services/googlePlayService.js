const { google } = require("googleapis");

const PACKAGE_NAME = "com.pradeepsingh.spendwise";

const ALLOWED_PRODUCTS = {
  spendwise_pro_monthly: "monthly",
  spendwise_pro_yearly: "yearly",
};

const fs = require("fs");
const path = require("path");

const getAndroidPublisher = () => {
  let credentials;

  const credentialsPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH;
  const credentialsJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;

  try {
    if (credentialsJson) {
      credentials = JSON.parse(credentialsJson);
    } else if (credentialsPath) {
      const resolvedPath = path.resolve(credentialsPath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error("Google Play service account file was not found");
      }

      credentials = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    } else {
      throw new Error(
        "Google Play service account credentials are not configured",
      );
    }
  } catch (error) {
    if (error.message === "Google Play service account file was not found") {
      throw error;
    }

    throw new Error("Google Play service account credentials are invalid");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });

  return google.androidpublisher({
    version: "v3",
    auth,
  });
};

const verifySubscription = async ({ productId, purchaseToken }) => {
  if (!Object.hasOwn(ALLOWED_PRODUCTS, productId)) {
    const error = new Error("Unsupported subscription product");
    error.statusCode = 400;
    throw error;
  }

  if (typeof purchaseToken !== "string" || !purchaseToken.trim()) {
    const error = new Error("Purchase token is required");
    error.statusCode = 400;
    throw error;
  }

  const publisher = getAndroidPublisher();

  const { data } = await publisher.purchases.subscriptionsv2.get({
    packageName: PACKAGE_NAME,
    token: purchaseToken,
  });

  const lineItems = data.lineItems || [];
  const matchingItem = lineItems.find((item) => item.productId === productId);

  if (!matchingItem) {
    const error = new Error("Purchase does not match the requested product");
    error.statusCode = 400;
    throw error;
  }

  const expiryTime = matchingItem.expiryTime
    ? new Date(matchingItem.expiryTime)
    : null;

  const entitledStates = new Set([
    "SUBSCRIPTION_STATE_ACTIVE",
    "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
    "SUBSCRIPTION_STATE_CANCELED",
  ]);

  const isActive =
    entitledStates.has(data.subscriptionState) &&
    expiryTime instanceof Date &&
    !Number.isNaN(expiryTime.getTime()) &&
    expiryTime.getTime() > Date.now();

  return {
    productId,
    plan: "pro",
    status: isActive ? "active" : "expired",
    expiresAt: expiryTime,
    purchaseToken,
    subscriptionState: data.subscriptionState,
    acknowledgementState: data.acknowledgementState,
    linkedPurchaseToken: data.linkedPurchaseToken || null,
  };
};

const acknowledgeSubscription = async ({ productId, purchaseToken }) => {
  if (!Object.hasOwn(ALLOWED_PRODUCTS, productId)) {
    throw new Error("Unsupported subscription product");
  }

  const publisher = getAndroidPublisher();

  await publisher.purchases.subscriptions.acknowledge({
    packageName: PACKAGE_NAME,
    subscriptionId: productId,
    token: purchaseToken,
    requestBody: {
      developerPayload: "spendwise-pro",
    },
  });
};

const verifySubscriptionByPurchaseToken = async (purchaseToken) => {
  if (typeof purchaseToken !== "string" || !purchaseToken.trim()) {
    const error = new Error("Purchase token is required");
    error.statusCode = 400;
    throw error;
  }

  const publisher = getAndroidPublisher();

  const { data } = await publisher.purchases.subscriptionsv2.get({
    packageName: PACKAGE_NAME,
    token: purchaseToken,
  });

  const lineItems = data.lineItems || [];

  const matchingItem = lineItems.find((item) =>
    Object.hasOwn(ALLOWED_PRODUCTS, item.productId),
  );

  if (!matchingItem) {
    const error = new Error("No supported subscription product found");
    error.statusCode = 400;
    throw error;
  }

  const expiryTime = matchingItem.expiryTime
    ? new Date(matchingItem.expiryTime)
    : null;

  const hasFutureExpiry =
    expiryTime instanceof Date &&
    !Number.isNaN(expiryTime.getTime()) &&
    expiryTime.getTime() > Date.now();

  const state = data.subscriptionState;

  let status = "expired";

  if (state === "SUBSCRIPTION_STATE_PENDING") {
    status = "pending";
  } else if (
    [
      "SUBSCRIPTION_STATE_ACTIVE",
      "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
      "SUBSCRIPTION_STATE_CANCELED",
    ].includes(state) &&
    hasFutureExpiry
  ) {
    status = "active";
  } else if (state === "SUBSCRIPTION_STATE_CANCELED") {
    status = "cancelled";
  }

  return {
    productId: matchingItem.productId,
    plan: "pro",
    status,
    expiresAt: expiryTime,
    subscriptionState: state,
    acknowledgementState: data.acknowledgementState,
    linkedPurchaseToken: data.linkedPurchaseToken || null,
    latestSuccessfulOrderId: matchingItem.latestSuccessfulOrderId || null,
  };
};

const verifyVoidedPurchase = async ({ purchaseToken, orderId }) => {
  if (typeof purchaseToken !== "string" || !purchaseToken.trim()) {
    const error = new Error("Purchase token is required");
    error.statusCode = 400;
    throw error;
  }

  if (typeof orderId !== "string" || !orderId.trim()) {
    const error = new Error("Order ID is required");
    error.statusCode = 400;
    throw error;
  }

  const publisher = getAndroidPublisher();

  let pageToken;
  let matchedPurchase = null;

  do {
    const { data } = await publisher.purchases.voidedpurchases.list({
      packageName: PACKAGE_NAME,
      type: 1,
      maxResults: 1000,
      includeQuantityBasedPartialRefund: true,
      ...(pageToken ? { token: pageToken } : {}),
    });

    const purchases = data.voidedPurchases || [];

    matchedPurchase = purchases.find(
      (purchase) =>
        purchase.purchaseToken === purchaseToken &&
        purchase.orderId === orderId,
    );

    if (matchedPurchase) {
      break;
    }

    pageToken = data.tokenPagination?.nextPageToken || undefined;
  } while (pageToken);

  if (!matchedPurchase) {
    return {
      verified: false,
      reason: "voided_purchase_not_found",
    };
  }

  return {
    verified: true,
    orderId: matchedPurchase.orderId,
    purchaseTimeMillis: matchedPurchase.purchaseTimeMillis,
    voidedTimeMillis: matchedPurchase.voidedTimeMillis,
    voidedReason: matchedPurchase.voidedReason,
    voidedSource: matchedPurchase.voidedSource,
    voidedQuantity: matchedPurchase.voidedQuantity ?? null,
    isPartialRefund: typeof matchedPurchase.voidedQuantity === "number",
  };
};

module.exports = {
  ALLOWED_PRODUCTS,
  verifySubscription,
  acknowledgeSubscription,
  verifyVoidedPurchase,
  verifySubscriptionByPurchaseToken,
};
