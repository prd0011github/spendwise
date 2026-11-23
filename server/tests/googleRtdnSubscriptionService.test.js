const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const userModelPath = require.resolve("../src/models/User");
const googlePlayServicePath =
  require.resolve("../src/services/googlePlayService");
const subscriptionServicePath =
  require.resolve("../src/services/googleRtdnSubscriptionService");

let mockUser;
let findOneCalls;
let updateCalls;
let verifiedSubscription;
let googleVerificationCalls;
let updateError;
let updateResult;

const mockUserModel = {
  findOne: (filter) => {
    findOneCalls.push(filter);

    return {
      select: async () => {
        if (
          filter["subscription.purchaseTokenHash"] ===
          mockUser?.subscription?.purchaseTokenHash
        ) {
          return mockUser;
        }

        return null;
      },
    };
  },

  findOneAndUpdate: async (filter, update, options) => {
    updateCalls.push({ filter, update, options });

    if (updateError) {
      throw updateError;
    }

    if (updateResult === null || !mockUser) {
      return null;
    }

    Object.entries(update.$set || {}).forEach(([path, value]) => {
      const keys = path.split(".");
      let current = mockUser;

      keys.slice(0, -1).forEach((key) => {
        current[key] ??= {};
        current = current[key];
      });

      current[keys[keys.length - 1]] = value;
    });

    Object.entries(update.$inc || {}).forEach(([path, value]) => {
      const keys = path.split(".");
      let current = mockUser;

      keys.slice(0, -1).forEach((key) => {
        current[key] ??= {};
        current = current[key];
      });

      const lastKey = keys[keys.length - 1];
      current[lastKey] = (current[lastKey] ?? 0) + value;
    });

    return mockUser;
  },
};

const mockGooglePlayService = {
  verifySubscriptionByPurchaseToken: async (token) => {
    googleVerificationCalls.push(token);
    return verifiedSubscription;
  },
};

require.cache[userModelPath] = {
  id: userModelPath,
  filename: userModelPath,
  loaded: true,
  exports: mockUserModel,
};

require.cache[googlePlayServicePath] = {
  id: googlePlayServicePath,
  filename: googlePlayServicePath,
  loaded: true,
  exports: mockGooglePlayService,
};

const { processGoogleSubscriptionNotification } = require(
  subscriptionServicePath,
);

const hashPurchaseToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createUser = (overrides = {}) => ({
  _id: "user-123",
  subscription: {
    plan: "free",
    status: "inactive",
    billingProvider: "google_play",
    productId: null,
    purchaseTokenHash: null,
    expiresAt: null,
    revision: 0,
    ...overrides,
  },
});

const createLinkedUser = (purchaseToken, overrides = {}) =>
  createUser({
    ...overrides,
    purchaseTokenHash: hashPurchaseToken(purchaseToken),
  });

const createVerification = (overrides = {}) => ({
  status: "active",
  productId: "spendwise_pro_monthly",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  linkedPurchaseToken: null,
  ...overrides,
});

beforeEach(() => {
  mockUser = null;
  findOneCalls = [];
  updateCalls = [];
  googleVerificationCalls = [];
  updateError = null;
  updateResult = undefined;
  verifiedSubscription = createVerification();
});

test("activates Pro for a linked Google Play purchase", async () => {
  const purchaseToken = "test-purchase-token";
  mockUser = createLinkedUser(purchaseToken);

  const result = await processGoogleSubscriptionNotification(purchaseToken);

  assert.equal(result.processed, true);
  assert.equal(result.plan, "pro");
  assert.equal(mockUser.subscription.plan, "pro");
  assert.equal(mockUser.subscription.status, "active");
  assert.equal(mockUser.subscription.productId, "spendwise_pro_monthly");
  assert.equal(
    mockUser.subscription.purchaseTokenHash,
    hashPurchaseToken(purchaseToken),
  );
  assert.equal(mockUser.subscription.revision, 1);

  assert.equal(updateCalls.length, 1);
  assert.equal(updateCalls[0].update.$inc["subscription.revision"], 1);
  assert.equal(updateCalls[0].options.new, true);
  assert.deepEqual(googleVerificationCalls, [purchaseToken]);
});

test("does not update a user when the purchase token is not linked", async () => {
  const result = await processGoogleSubscriptionNotification(
    "unlinked-purchase-token",
  );

  assert.equal(result.processed, false);
  assert.equal(result.reason, "purchase_not_linked");
  assert.equal(updateCalls.length, 0);
});

test("does not overwrite a subscription from another billing provider", async () => {
  const token = "existing-token";

  mockUser = createLinkedUser(token, {
    billingProvider: "web",
  });

  const result = await processGoogleSubscriptionNotification(token);

  assert.equal(result.processed, false);
  assert.equal(result.reason, "different_billing_provider");
  assert.equal(updateCalls.length, 0);
});

test("sets the plan to free when Google reports an expired subscription", async () => {
  mockUser = createLinkedUser("expired-purchase-token");

  verifiedSubscription = createVerification({
    status: "expired",
    expiresAt: null,
  });

  const result = await processGoogleSubscriptionNotification(
    "expired-purchase-token",
  );

  assert.equal(result.processed, true);
  assert.equal(result.plan, "free");
  assert.equal(mockUser.subscription.status, "expired");
  assert.equal(mockUser.subscription.revision, 1);
});

test("keeps the plan free for a pending subscription", async () => {
  mockUser = createLinkedUser("pending-purchase-token");

  verifiedSubscription = createVerification({
    status: "pending",
    expiresAt: null,
  });

  const result = await processGoogleSubscriptionNotification(
    "pending-purchase-token",
  );

  assert.equal(result.processed, true);
  assert.equal(result.plan, "free");
  assert.equal(mockUser.subscription.status, "pending");
});

test("finds the existing owner through a linked purchase token", async () => {
  const linkedToken = "old-purchase-token";
  const newToken = "replacement-purchase-token";

  mockUser = createLinkedUser(linkedToken);

  verifiedSubscription = createVerification({
    linkedPurchaseToken: linkedToken,
  });

  const result = await processGoogleSubscriptionNotification(newToken);

  assert.equal(result.processed, true);
  assert.equal(result.plan, "pro");
  assert.equal(
    mockUser.subscription.purchaseTokenHash,
    hashPurchaseToken(newToken),
  );
  assert.equal(mockUser.subscription.revision, 1);

  assert.equal(findOneCalls.length, 2);
  assert.equal(
    findOneCalls[1]["subscription.purchaseTokenHash"],
    hashPurchaseToken(linkedToken),
  );

  assert.equal(
    updateCalls[0].filter["subscription.purchaseTokenHash"],
    hashPurchaseToken(linkedToken),
  );
});

test("rejects an empty purchase token", async () => {
  await assert.rejects(
    processGoogleSubscriptionNotification(""),
    /purchase token is missing/,
  );

  assert.equal(googleVerificationCalls.length, 0);
  assert.equal(updateCalls.length, 0);
});

test("propagates database update errors for Pub/Sub retry", async () => {
  mockUser = createLinkedUser("duplicate-token");

  const error = new Error("Duplicate key");
  error.code = 11000;
  updateError = error;

  await assert.rejects(
    processGoogleSubscriptionNotification("duplicate-token"),
    (caughtError) => caughtError.code === 11000,
  );
});

test("throws a retryable conflict when the subscription changes concurrently", async () => {
  mockUser = createLinkedUser("concurrent-token");
  updateResult = null;

  await assert.rejects(
    processGoogleSubscriptionNotification("concurrent-token"),
    (error) =>
      error.statusCode === 503 && error.code === "SUBSCRIPTION_UPDATE_CONFLICT",
  );

  assert.equal(updateCalls.length, 1);
});

test("supports existing users whose revision field is missing", async () => {
  mockUser = createLinkedUser("legacy-token");
  delete mockUser.subscription.revision;

  const result = await processGoogleSubscriptionNotification("legacy-token");

  assert.equal(result.processed, true);
  assert.equal(mockUser.subscription.revision, 1);

  const revisionFilter = updateCalls[0].filter.$or;

  assert.ok(
    revisionFilter.some(
      (condition) => condition["subscription.revision"]?.$exists === false,
    ),
  );
});

test("does not let an old purchase token update a replacement subscription", async () => {
  const oldToken = "old-purchase-token";
  const newToken = "new-purchase-token";

  // The account is now linked to the replacement token.
  mockUser = createLinkedUser(newToken);

  // Google does not report a linked replacement for this old token.
  verifiedSubscription = createVerification();

  const result = await processGoogleSubscriptionNotification(oldToken);

  assert.equal(result.processed, false);
  assert.equal(result.reason, "purchase_not_linked");
  assert.equal(updateCalls.length, 0);
  assert.equal(
    mockUser.subscription.purchaseTokenHash,
    hashPurchaseToken(newToken),
  );
});
