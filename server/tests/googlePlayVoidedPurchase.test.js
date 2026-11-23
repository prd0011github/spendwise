const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const googlePlayPath = require.resolve("../src/services/googlePlayService");
const googleapisPath = require.resolve("googleapis");

let responses;
let apiCalls;

const mockPublisher = {
  purchases: {
    voidedpurchases: {
      list: async (params) => {
        apiCalls.push(params);

        if (!responses.length) {
          throw new Error("No mock API response configured");
        }

        return { data: responses.shift() };
      },
    },
  },
};

const mockGoogle = {
  auth: {
    GoogleAuth: class {
      constructor() {}
    },
  },
  androidpublisher: () => mockPublisher,
};

const mockModule = new Module(googleapisPath);
mockModule.filename = googleapisPath;
mockModule.loaded = true;
mockModule.exports = { google: mockGoogle };

require.cache[googleapisPath] = mockModule;

process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = JSON.stringify({
  client_email: "test@example.com",
  private_key: "test-private-key",
});

delete require.cache[googlePlayPath];

const { verifyVoidedPurchase } = require(googlePlayPath);

beforeEach(() => {
  responses = [];
  apiCalls = [];
});

test("verifies an exact voided subscription order", async () => {
  responses = [
    {
      voidedPurchases: [
        {
          purchaseToken: "purchase-token-1",
          orderId: "GPA.1234-5678-9012-34567",
          voidedReason: 1,
          voidedSource: 1,
          voidedTimeMillis: "1795000000000",
          purchaseTimeMillis: "1794000000000",
        },
      ],
    },
  ];

  const result = await verifyVoidedPurchase({
    purchaseToken: "purchase-token-1",
    orderId: "GPA.1234-5678-9012-34567",
  });

  assert.equal(result.verified, true);
  assert.equal(result.orderId, "GPA.1234-5678-9012-34567");
  assert.equal(result.isPartialRefund, false);
  assert.equal(apiCalls.length, 1);
  assert.equal(apiCalls[0].type, 1);
  assert.equal(apiCalls[0].includeQuantityBasedPartialRefund, true);
});

test("identifies a partial quantity refund", async () => {
  responses = [
    {
      voidedPurchases: [
        {
          purchaseToken: "purchase-token-2",
          orderId: "GPA.2222-3333-4444-55555",
          voidedQuantity: 1,
        },
      ],
    },
  ];

  const result = await verifyVoidedPurchase({
    purchaseToken: "purchase-token-2",
    orderId: "GPA.2222-3333-4444-55555",
  });

  assert.equal(result.verified, true);
  assert.equal(result.isPartialRefund, true);
  assert.equal(result.voidedQuantity, 1);
});

test("does not match a different order ID", async () => {
  responses = [
    {
      voidedPurchases: [
        {
          purchaseToken: "purchase-token-3",
          orderId: "GPA.3333-4444-5555-66666",
        },
      ],
    },
  ];

  const result = await verifyVoidedPurchase({
    purchaseToken: "purchase-token-3",
    orderId: "GPA.9999-8888-7777-66666",
  });

  assert.equal(result.verified, false);
  assert.equal(result.reason, "voided_purchase_not_found");
});

test("does not match a different purchase token", async () => {
  responses = [
    {
      voidedPurchases: [
        {
          purchaseToken: "different-token",
          orderId: "GPA.4444-5555-6666-77777",
        },
      ],
    },
  ];

  const result = await verifyVoidedPurchase({
    purchaseToken: "purchase-token-4",
    orderId: "GPA.4444-5555-6666-77777",
  });

  assert.equal(result.verified, false);
});

test("checks the next page when the order is not on the first page", async () => {
  responses = [
    {
      voidedPurchases: [],
      tokenPagination: {
        nextPageToken: "next-page-token",
      },
    },
    {
      voidedPurchases: [
        {
          purchaseToken: "purchase-token-5",
          orderId: "GPA.5555-6666-7777-88888",
        },
      ],
    },
  ];

  const result = await verifyVoidedPurchase({
    purchaseToken: "purchase-token-5",
    orderId: "GPA.5555-6666-7777-88888",
  });

  assert.equal(result.verified, true);
  assert.equal(apiCalls.length, 2);
  assert.equal(apiCalls[1].token, "next-page-token");
});

test("rejects a missing purchase token", async () => {
  await assert.rejects(
    verifyVoidedPurchase({
      purchaseToken: "",
      orderId: "GPA.1234-5678-9012-34567",
    }),
    /Purchase token is required/,
  );

  assert.equal(apiCalls.length, 0);
});

test("rejects a missing order ID", async () => {
  await assert.rejects(
    verifyVoidedPurchase({
      purchaseToken: "purchase-token-6",
      orderId: "",
    }),
    /Order ID is required/,
  );

  assert.equal(apiCalls.length, 0);
});

test("propagates Google API errors for retry", async () => {
  responses = [];

  await assert.rejects(
    verifyVoidedPurchase({
      purchaseToken: "purchase-token-7",
      orderId: "GPA.7777-8888-9999-00000",
    }),
    /No mock API response configured/,
  );
});
