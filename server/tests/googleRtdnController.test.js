const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const subscriptionServicePath =
  require.resolve("../src/services/googleRtdnSubscriptionService");
const eventServicePath =
  require.resolve("../src/services/googleRtdnEventService");
const controllerPath =
  require.resolve("../src/controllers/googleRtdnController");
const voidedServicePath =
  require.resolve("../src/services/googleRtdnVoidedPurchaseService");

let claimResult;
let subscriptionResult;
let subscriptionError;
let completeResult;
let releaseError;
let calls;
let voidedPurchaseResult;
let voidedPurchaseError;

const mockSubscriptionService = {
  processGoogleSubscriptionNotification: async (token) => {
    calls.purchaseTokens.push(token);

    if (subscriptionError) {
      throw subscriptionError;
    }

    return subscriptionResult;
  },
};

const mockVoidedPurchaseService = {
  processGoogleVoidedPurchaseNotification: async (payload) => {
    calls.voidedPurchaseNotifications.push(payload);

    if (voidedPurchaseError) {
      throw voidedPurchaseError;
    }

    return voidedPurchaseResult;
  },
};

const mockEventService = {
  claimRtdnEvent: async (messageId) => {
    calls.claimedIds.push(messageId);
    return claimResult;
  },

  completeRtdnEvent: async (messageId, lockToken) => {
    calls.completed.push({ messageId, lockToken });
    return completeResult;
  },

  releaseRtdnEvent: async (messageId, lockToken) => {
    calls.released.push({ messageId, lockToken });

    if (releaseError) {
      throw releaseError;
    }

    return true;
  },
};

const installMock = (modulePath, exports) => {
  const mockModule = new Module(modulePath);
  mockModule.filename = modulePath;
  mockModule.loaded = true;
  mockModule.exports = exports;
  require.cache[modulePath] = mockModule;
};

installMock(subscriptionServicePath, mockSubscriptionService);
installMock(eventServicePath, mockEventService);
installMock(voidedServicePath, mockVoidedPurchaseService);

delete require.cache[controllerPath];

const { googleRtdnController } = require(controllerPath);

const createRequest = (notification, messageId = "message-1") => ({
  body: {
    message: {
      messageId,
      data: Buffer.from(
        JSON.stringify({
          packageName: "com.pradeepsingh.spendwise",
          ...notification,
        }),
      ).toString("base64"),
    },
  },
});

const createResponse = () => {
  const response = {
    statusCode: null,
    body: null,
    sent: false,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.body = data;
      return this;
    },

    send() {
      this.sent = true;
      return this;
    },
  };

  return response;
};

beforeEach(() => {
  claimResult = {
    claimed: true,
    lockToken: "test-lock-token",
  };

  subscriptionResult = {
    processed: true,
    status: "active",
    plan: "pro",
  };

  subscriptionError = null;
  completeResult = true;
  releaseError = null;

  calls = {
    purchaseTokens: [],
    voidedPurchaseNotifications: [],
    claimedIds: [],
    completed: [],
    released: [],
  };

  voidedPurchaseResult = {
    processed: true,
    revoked: true,
    reason: "current_subscription_fully_refunded",
  };

  voidedPurchaseError = null;
});

test("processes a valid subscription notification", async () => {
  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
      notificationType: 2,
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);

  assert.deepEqual(calls.purchaseTokens, ["test-purchase-token"]);

  assert.deepEqual(calls.claimedIds, ["message-1"]);
  assert.equal(calls.completed.length, 1);
  assert.equal(calls.released.length, 0);
});

test("acknowledges an already completed duplicate event", async () => {
  claimResult = {
    claimed: false,
    completed: true,
  };

  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);
  assert.equal(calls.purchaseTokens.length, 0);
  assert.equal(calls.completed.length, 0);
});

test("returns 503 when another worker is processing the event", async () => {
  claimResult = {
    claimed: false,
    busy: true,
  };

  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 503);
  assert.equal(calls.purchaseTokens.length, 0);
});

test("returns 400 when the Pub/Sub message ID is missing", async () => {
  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  delete req.body.message.messageId;

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when the subscription purchase token is missing", async () => {
  const req = createRequest({
    subscriptionNotification: {
      notificationType: 2,
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 503 and releases the event when subscription processing fails", async () => {
  subscriptionError = new Error("Google Play API unavailable");

  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 503);
  assert.equal(calls.completed.length, 0);
  assert.equal(calls.released.length, 1);
});

test("returns 503 when the event cannot be completed", async () => {
  completeResult = false;

  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 503);
  assert.equal(calls.completed.length, 1);
  assert.equal(calls.released.length, 1);
});

test("processes a full-refund voided purchase notification", async () => {
  const req = createRequest({
    voidedPurchaseNotification: {
      purchaseToken: "test-purchase-token",
      orderId: "test-order",
      refundType: 1,
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);

  assert.deepEqual(calls.voidedPurchaseNotifications, [
    {
      purchaseToken: "test-purchase-token",
      orderId: "test-order",
      refundType: 1,
    },
  ]);

  assert.deepEqual(calls.claimedIds, ["message-1"]);
  assert.equal(calls.completed.length, 1);
  assert.equal(calls.released.length, 0);
});

test("processes a partial-refund voided purchase notification", async () => {
  voidedPurchaseResult = {
    processed: true,
    revoked: false,
    reason: "partial_refund",
  };

  const req = createRequest({
    voidedPurchaseNotification: {
      purchaseToken: "test-purchase-token",
      orderId: "test-order",
      refundType: 2,
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);
  assert.equal(calls.voidedPurchaseNotifications.length, 1);
  assert.equal(calls.completed.length, 1);
  assert.equal(calls.released.length, 0);
});

test("returns 400 when the voided purchase token is missing", async () => {
  const req = createRequest({
    voidedPurchaseNotification: {
      orderId: "test-order",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when the voided purchase order ID is missing", async () => {
  const req = createRequest({
    voidedPurchaseNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("acknowledges an already completed duplicate voided purchase event", async () => {
  claimResult = {
    claimed: false,
    completed: true,
  };

  const req = createRequest({
    voidedPurchaseNotification: {
      purchaseToken: "test-purchase-token",
      orderId: "test-order",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);
  assert.equal(calls.voidedPurchaseNotifications.length, 0);
  assert.equal(calls.completed.length, 0);
});

test("returns 503 and releases the event when voided purchase processing fails", async () => {
  voidedPurchaseError = new Error("Google Play API unavailable");

  const req = createRequest({
    voidedPurchaseNotification: {
      purchaseToken: "test-purchase-token",
      orderId: "test-order",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 503);
  assert.equal(calls.completed.length, 0);
  assert.equal(calls.released.length, 1);
});

test("acknowledges Google Play test notifications", async () => {
  const req = createRequest({
    testNotification: {},
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);
  assert.equal(calls.claimedIds.length, 0);
});

test("rejects notifications from a different package", async () => {
  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  const decoded = JSON.parse(
    Buffer.from(req.body.message.data, "base64").toString("utf8"),
  );

  decoded.packageName = "com.example.other";

  req.body.message.data = Buffer.from(JSON.stringify(decoded)).toString(
    "base64",
  );

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when RTDN data contains invalid Base64", async () => {
  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  req.body.message.data = "invalid-base64!";

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when RTDN data contains invalid JSON", async () => {
  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
  });

  req.body.message.data = Buffer.from("{invalid-json").toString("base64");

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when the decoded RTDN payload is an array", async () => {
  const req = createRequest({});
  req.body.message.data = Buffer.from(
    JSON.stringify(["invalid-payload"]),
  ).toString("base64");

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when subscriptionNotification is not an object", async () => {
  const req = createRequest({
    subscriptionNotification: "invalid",
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when voidedPurchaseNotification is not an object", async () => {
  const req = createRequest({
    voidedPurchaseNotification: [],
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when testNotification is not an object", async () => {
  const req = createRequest({
    testNotification: "invalid",
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 400 when subscription and voided notifications are both present", async () => {
  const req = createRequest({
    subscriptionNotification: {
      purchaseToken: "test-purchase-token",
    },
    voidedPurchaseNotification: {
      purchaseToken: "test-purchase-token",
      orderId: "test-order",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(calls.claimedIds.length, 0);
});

test("returns 503 even when releasing a failed event throws", async () => {
  subscriptionError = new Error("Google Play API unavailable");
  releaseError = new Error("Database unavailable");

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const req = createRequest({
      subscriptionNotification: {
        purchaseToken: "test-purchase-token",
      },
    });

    const res = createResponse();

    await googleRtdnController(req, res);

    assert.equal(res.statusCode, 503);
    assert.equal(calls.completed.length, 0);
    assert.equal(calls.released.length, 1);
  } finally {
    console.error = originalConsoleError;
  }
});
