const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const crypto = require("node:crypto");

const userModelPath = require.resolve("../src/models/User");
const googlePlayPath = require.resolve("../src/services/googlePlayService");
const servicePath =
  require.resolve("../src/services/googleRtdnVoidedPurchaseService");

let mockUser;
let voidedResult;
let currentSubscription;
let googleErrors;
let databaseError;
let forceUpdateConflict;
let calls;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const mockUserModel = {
  findOne: (filter) => ({
    select: async () => {
      calls.userLookups.push(filter);
      return mockUser;
    },
  }),

  findOneAndUpdate: async (filter, update, options) => {
    calls.updates.push({ filter, update, options });

    if (databaseError) throw databaseError;
    if (forceUpdateConflict || !mockUser) return null;

    for (const [key, value] of Object.entries(update.$set || {})) {
      const field = key.split(".").pop();
      mockUser.subscription[field] = value;
    }

    for (const [key, value] of Object.entries(update.$inc || {})) {
      const field = key.split(".").pop();
      mockUser.subscription[field] =
        (mockUser.subscription[field] || 0) + value;
    }

    return mockUser;
  },
};

const mockGooglePlay = {
  verifyVoidedPurchase: async (params) => {
    calls.voidedVerifications.push(params);
    if (googleErrors) throw googleErrors;
    return voidedResult;
  },

  verifySubscriptionByPurchaseToken: async (token) => {
    calls.subscriptionVerifications.push(token);
    if (googleErrors) throw googleErrors;
    return currentSubscription;
  },
};

const installMock = (modulePath, exports) => {
  const mockModule = new Module(modulePath);
  mockModule.filename = modulePath;
  mockModule.loaded = true;
  mockModule.exports = exports;
  require.cache[modulePath] = mockModule;
};

installMock(userModelPath, mockUserModel);
installMock(googlePlayPath, mockGooglePlay);

delete require.cache[servicePath];

const { processGoogleVoidedPurchaseNotification } = require(servicePath);

const createUser = (token, billingProvider = "google_play", revision = 3) => ({
  _id: "user-1",
  subscription: {
    plan: "pro",
    status: "active",
    billingProvider,
    productId: "spendwise_pro_monthly",
    purchaseTokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 86400000),
    revision,
  },
});

const notification = {
  purchaseToken: "test-purchase-token",
  orderId: "GPA.1234-5678-9012-34567",
};

beforeEach(() => {
  mockUser = createUser(notification.purchaseToken);

  voidedResult = {
    verified: true,
    orderId: notification.orderId,
    isPartialRefund: false,
    voidedQuantity: null,
  };

  currentSubscription = {
    status: "expired",
    expiresAt: null,
    latestSuccessfulOrderId: notification.orderId,
  };

  googleErrors = null;
  databaseError = null;
  forceUpdateConflict = false;

  calls = {
    voidedVerifications: [],
    subscriptionVerifications: [],
    userLookups: [],
    updates: [],
  };
});

test("revokes Pro for a verified full refund of the current order", async () => {
  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.processed, true);
  assert.equal(result.revoked, true);
  assert.equal(result.plan, "free");
  assert.equal(mockUser.subscription.plan, "free");
  assert.equal(mockUser.subscription.status, "expired");
  assert.equal(mockUser.subscription.revision, 4);
  assert.equal(calls.subscriptionVerifications.length, 1);
  assert.equal(calls.updates.length, 1);
});

test("uses an atomic update with the current token and revision", async () => {
  await processGoogleVoidedPurchaseNotification(notification);

  const { filter, update, options } = calls.updates[0];

  assert.equal(filter._id, mockUser._id);
  assert.equal(filter["subscription.billingProvider"], "google_play");
  assert.equal(
    filter["subscription.purchaseTokenHash"],
    hashToken(notification.purchaseToken),
  );

  assert.deepEqual(filter.$or, [
    { "subscription.revision": 3 },
    { "subscription.revision": { $exists: false } },
  ]);

  assert.equal(update.$set["subscription.plan"], "free");
  assert.equal(update.$inc["subscription.revision"], 1);
  assert.equal(options.new, true);
  assert.equal(options.runValidators, true);
});

test("preserves Pro when an older renewal is refunded but the subscription is active", async () => {
  currentSubscription.latestSuccessfulOrderId = "GPA.9999-8888-7777-66666";
  currentSubscription.status = "active";
  currentSubscription.expiresAt = new Date(Date.now() + 86400000);

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.revoked, false);
  assert.equal(result.reason, "subscription_still_active");
  assert.equal(calls.updates.length, 0);
});

test("preserves Pro when the current order does not match", async () => {
  currentSubscription.latestSuccessfulOrderId = "GPA.9999-8888-7777-66666";

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.revoked, false);
  assert.equal(result.reason, "voided_order_is_not_current_order");
  assert.equal(calls.updates.length, 0);
});

test("does not revoke Pro for a partial refund", async () => {
  voidedResult.isPartialRefund = true;
  voidedResult.voidedQuantity = 1;

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.processed, true);
  assert.equal(result.revoked, false);
  assert.equal(result.reason, "partial_refund");
  assert.equal(calls.userLookups.length, 0);
  assert.equal(calls.updates.length, 0);
});

test("does not revoke Pro for RTDN partial refund type", async () => {
  const result = await processGoogleVoidedPurchaseNotification({
    ...notification,
    refundType: 2,
  });

  assert.equal(result.revoked, false);
  assert.equal(result.reason, "partial_refund");
  assert.equal(calls.updates.length, 0);
});

test("does not modify an account for an unverified voided purchase", async () => {
  voidedResult = {
    verified: false,
    reason: "voided_purchase_not_found",
  };

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.processed, false);
  assert.equal(result.reason, "voided_purchase_not_verified");
  assert.equal(calls.userLookups.length, 0);
  assert.equal(calls.updates.length, 0);
});

test("does not modify a subscription from another billing provider", async () => {
  mockUser = createUser(notification.purchaseToken, "web");

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.processed, false);
  assert.equal(result.reason, "different_billing_provider");
  assert.equal(calls.subscriptionVerifications.length, 0);
  assert.equal(calls.updates.length, 0);
});

test("does not modify an account when the purchase token is unlinked", async () => {
  mockUser = null;

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.processed, false);
  assert.equal(result.reason, "purchase_not_linked");
  assert.equal(calls.updates.length, 0);
});

test("does not revoke when Google has no latest successful order ID", async () => {
  currentSubscription.latestSuccessfulOrderId = null;

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.revoked, false);
  assert.equal(result.reason, "voided_order_is_not_current_order");
  assert.equal(calls.updates.length, 0);
});

test("propagates Google API failures for Pub/Sub retry", async () => {
  googleErrors = new Error("Google Play API unavailable");

  await assert.rejects(
    processGoogleVoidedPurchaseNotification(notification),
    /Google Play API unavailable/,
  );

  assert.equal(calls.updates.length, 0);
});

test("propagates database update failures for Pub/Sub retry", async () => {
  databaseError = new Error("Database unavailable");

  await assert.rejects(
    processGoogleVoidedPurchaseNotification(notification),
    /Database unavailable/,
  );

  assert.equal(calls.updates.length, 1);
});

test("throws a retryable conflict when the subscription changes concurrently", async () => {
  forceUpdateConflict = true;

  await assert.rejects(
    processGoogleVoidedPurchaseNotification(notification),
    (error) =>
      error.statusCode === 503 && error.code === "SUBSCRIPTION_UPDATE_CONFLICT",
  );

  assert.equal(calls.updates.length, 1);
  assert.equal(mockUser.subscription.plan, "pro");
});

test("supports existing users whose revision field is missing", async () => {
  delete mockUser.subscription.revision;

  const result = await processGoogleVoidedPurchaseNotification(notification);

  assert.equal(result.revoked, true);
  assert.equal(mockUser.subscription.plan, "free");
  assert.equal(mockUser.subscription.revision, 1);

  const { filter } = calls.updates[0];

  assert.deepEqual(filter.$or, [
    { "subscription.revision": 0 },
    { "subscription.revision": { $exists: false } },
  ]);
});

test("does not revoke a replacement subscription using an old purchase token", async () => {
  mockUser = null;

  const result = await processGoogleVoidedPurchaseNotification({
    purchaseToken: "old-purchase-token",
    orderId: notification.orderId,
  });

  assert.equal(result.processed, false);
  assert.equal(result.reason, "purchase_not_linked");
  assert.equal(calls.updates.length, 0);
});

test("rejects a missing order ID", async () => {
  await assert.rejects(
    processGoogleVoidedPurchaseNotification({
      purchaseToken: notification.purchaseToken,
      orderId: "",
    }),
    /order ID is missing/,
  );

  assert.equal(calls.voidedVerifications.length, 0);
});
