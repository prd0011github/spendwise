const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const userModelPath = require.resolve("../src/models/User");
const googlePlayServicePath =
  require.resolve("../src/services/googlePlayService");
const controllerPath =
  require.resolve("../src/controllers/subscriptionController");

let mockUser;
let existingOwner;
let verifiedSubscription;
let verificationError;
let acknowledgementError;
let updateError;
let updateResult;
let verificationCalls;
let acknowledgementCalls;
let updateCalls;

const mockUserModel = {
  findOne: () => ({
    select: async () => existingOwner,
  }),

  findById: async () => mockUser,

  findOneAndUpdate: async (filter, update, options) => {
    updateCalls.push({ filter, update, options });

    if (updateError) {
      throw updateError;
    }

    if (updateResult === null) {
      return null;
    }

    if (!mockUser) {
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
  verifySubscription: async (params) => {
    verificationCalls.push(params);

    if (verificationError) {
      throw verificationError;
    }

    return verifiedSubscription;
  },

  acknowledgeSubscription: async (params) => {
    acknowledgementCalls.push(params);

    if (acknowledgementError) {
      throw acknowledgementError;
    }
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

const { verifyGoogleSubscription } = require(controllerPath);

const createUser = (overrides = {}) => ({
  _id: "user-123",
  subscription: {
    plan: "free",
    status: "inactive",
    billingProvider: null,
    productId: null,
    purchaseTokenHash: null,
    expiresAt: null,
    revision: 0,
    ...overrides,
  },
});

const createVerification = (overrides = {}) => ({
  status: "active",
  productId: "spendwise_pro_monthly",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
  ...overrides,
});

const createRequest = (body = {}) => ({
  body,
  userId: "user-123",
});

const createResponse = () => {
  const res = {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.body = data;
      return this;
    },
  };

  return res;
};

const validPurchase = {
  productId: "spendwise_pro_monthly",
  purchaseToken: "test-purchase-token",
};

beforeEach(() => {
  mockUser = createUser();
  existingOwner = null;
  verifiedSubscription = createVerification();
  verificationError = null;
  acknowledgementError = null;
  updateError = null;
  updateResult = undefined;
  verificationCalls = [];
  acknowledgementCalls = [];
  updateCalls = [];
});

test("successfully verifies and links an active subscription", async () => {
  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.plan, "pro");
  assert.equal(res.body.data.status, "active");
  assert.equal(res.body.data.acknowledgementPending, false);

  assert.equal(mockUser.subscription.billingProvider, "google_play");
  assert.equal(mockUser.subscription.productId, validPurchase.productId);
  assert.ok(mockUser.subscription.purchaseTokenHash);
  assert.equal(mockUser.subscription.revision, 1);

  assert.equal(updateCalls.length, 1);
  assert.equal(updateCalls[0].update.$inc["subscription.revision"], 1);
  assert.equal(updateCalls[0].options.new, true);
  assert.equal(verificationCalls.length, 1);
});

test("rejects a missing product ID", async () => {
  const req = createRequest({
    purchaseToken: validPurchase.purchaseToken,
  });
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(verificationCalls.length, 0);
  assert.equal(updateCalls.length, 0);
});

test("rejects a missing purchase token", async () => {
  const req = createRequest({
    productId: validPurchase.productId,
  });
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(verificationCalls.length, 0);
  assert.equal(updateCalls.length, 0);
});

test("rejects a subscription that Google does not report as active", async () => {
  verifiedSubscription = createVerification({
    status: "expired",
    expiresAt: null,
  });

  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 402);
  assert.equal(res.body.data.status, "expired");
  assert.equal(updateCalls.length, 0);
  assert.equal(acknowledgementCalls.length, 0);
});

test("rejects a purchase token already linked to another account", async () => {
  existingOwner = {
    _id: "another-user",
  };

  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.success, false);
  assert.equal(updateCalls.length, 0);
});

test("returns 404 when the authenticated user does not exist", async () => {
  mockUser = null;

  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(updateCalls.length, 0);
});

test("does not overwrite a subscription from another billing provider", async () => {
  mockUser = createUser({
    plan: "pro",
    status: "active",
    billingProvider: "web",
    productId: "web-subscription",
  });

  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(mockUser.subscription.billingProvider, "web");
  assert.equal(mockUser.subscription.productId, "web-subscription");
  assert.equal(updateCalls.length, 0);
});

test("acknowledges a purchase when Google reports it is pending acknowledgement", async () => {
  verifiedSubscription = createVerification({
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
  });

  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.acknowledgementPending, false);
  assert.equal(acknowledgementCalls.length, 1);
  assert.equal(mockUser.subscription.revision, 1);
});

test("returns success with acknowledgementPending when acknowledgement fails", async () => {
  verifiedSubscription = createVerification({
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
  });

  acknowledgementError = new Error("Google acknowledgement unavailable");

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const req = createRequest(validPurchase);
    const res = createResponse();

    await verifyGoogleSubscription(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.acknowledgementPending, true);
    assert.equal(mockUser.subscription.revision, 1);
  } finally {
    console.error = originalConsoleError;
  }
});

test("returns 409 when the database reports a duplicate purchase token", async () => {
  const error = new Error("Duplicate key");
  error.code = 11000;
  updateError = error;

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const req = createRequest(validPurchase);
    const res = createResponse();

    await verifyGoogleSubscription(req, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.success, false);
  } finally {
    console.error = originalConsoleError;
  }
});

test("returns 400 for a Google Play validation error", async () => {
  verificationError = Object.assign(new Error("Invalid purchase token"), {
    statusCode: 400,
  });

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const req = createRequest(validPurchase);
    const res = createResponse();

    await verifyGoogleSubscription(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Invalid purchase token");
    assert.equal(updateCalls.length, 0);
  } finally {
    console.error = originalConsoleError;
  }
});

test("returns 502 when Google Play verification fails unexpectedly", async () => {
  verificationError = new Error("Google Play API unavailable");

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const req = createRequest(validPurchase);
    const res = createResponse();

    await verifyGoogleSubscription(req, res);

    assert.equal(res.statusCode, 502);
    assert.equal(updateCalls.length, 0);
  } finally {
    console.error = originalConsoleError;
  }
});

test("returns 409 when the subscription changes during verification", async () => {
  updateResult = null;

  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.success, false);
  assert.equal(mockUser.subscription.revision, 0);
});

test("supports existing users whose revision field is missing", async () => {
  mockUser = createUser();
  delete mockUser.subscription.revision;

  const req = createRequest(validPurchase);
  const res = createResponse();

  await verifyGoogleSubscription(req, res);

  assert.equal(res.statusCode, 200);

  const revisionFilter = updateCalls[0].filter.$and[0].$or;

  assert.ok(
    revisionFilter.some(
      (condition) => condition["subscription.revision"]?.$exists === false,
    ),
  );

  assert.equal(mockUser.subscription.revision, 1);
});
