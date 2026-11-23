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

const calls = {
  subscription: [],
  voided: [],
};

const installMock = (modulePath, exports) => {
  const mockModule = new Module(modulePath);
  mockModule.filename = modulePath;
  mockModule.loaded = true;
  mockModule.exports = exports;
  require.cache[modulePath] = mockModule;
};

installMock(subscriptionServicePath, {
  processGoogleSubscriptionNotification: async (token) => {
    calls.subscription.push(token);
    return { processed: true };
  },
});

installMock(voidedServicePath, {
  processGoogleVoidedPurchaseNotification: async (payload) => {
    calls.voided.push(payload);
    return { processed: true };
  },
});

installMock(eventServicePath, {
  claimRtdnEvent: async () => ({
    claimed: true,
    lockToken: "test-lock-token",
  }),
  completeRtdnEvent: async () => true,
  releaseRtdnEvent: async () => true,
});

delete require.cache[controllerPath];

const { googleRtdnController } = require(controllerPath);

const createResponse = () => ({
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
});

const createRequest = (notification) => ({
  body: {
    message: {
      messageId: "test-message-123",
      data: Buffer.from(JSON.stringify(notification)).toString("base64"),
    },
  },
});

beforeEach(() => {
  calls.subscription.length = 0;
  calls.voided.length = 0;
});

test("valid Google Play test notification returns 204", async () => {
  const req = createRequest({
    packageName: "com.pradeepsingh.spendwise",
    testNotification: { version: "1.0" },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);
});

test("missing Pub/Sub message returns 400", async () => {
  const res = createResponse();

  await googleRtdnController({ body: {} }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("invalid notification JSON returns 400", async () => {
  const req = {
    body: {
      message: {
        messageId: "invalid-message",
        data: Buffer.from("not-valid-json").toString("base64"),
      },
    },
  };

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid RTDN notification payload");
});

test("incorrect package name returns 400", async () => {
  const req = createRequest({
    packageName: "com.example.wrong",
    testNotification: { version: "1.0" },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid Android package name");
});

test("unsupported notification type returns 400", async () => {
  const req = createRequest({
    packageName: "com.pradeepsingh.spendwise",
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.message,
    "Unsupported or ambiguous RTDN notification type",
  );
});

test("subscription notification is processed successfully", async () => {
  const req = createRequest({
    packageName: "com.pradeepsingh.spendwise",
    subscriptionNotification: {
      version: "1.0",
      notificationType: 2,
      purchaseToken: "test-purchase-token",
      subscriptionId: "spendwise_pro_monthly",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);
  assert.deepEqual(calls.subscription, ["test-purchase-token"]);
});

test("voided purchase notification is processed successfully", async () => {
  const req = createRequest({
    packageName: "com.pradeepsingh.spendwise",
    voidedPurchaseNotification: {
      purchaseToken: "test-purchase-token",
      orderId: "test-order-id",
    },
  });

  const res = createResponse();

  await googleRtdnController(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.sent, true);
  assert.deepEqual(calls.voided, [
    {
      purchaseToken: "test-purchase-token",
      orderId: "test-order-id",
      refundType: undefined,
    },
  ]);
});
