const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const middlewarePath = require.resolve("../src/middleware/verifyGooglePubSub");
const googleapisPath = require.resolve("googleapis");

let verificationError;
let payload;
let verificationCalls;

const mockGoogleApis = {
  google: {
    auth: {
      OAuth2: class {
        async verifyIdToken(args) {
          verificationCalls.push(args);

          if (verificationError) {
            throw verificationError;
          }

          return {
            getPayload: () => payload,
          };
        }
      },
    },
  },
};

const installMock = (modulePath, exports) => {
  const mockModule = new Module(modulePath);
  mockModule.filename = modulePath;
  mockModule.loaded = true;
  mockModule.exports = exports;
  require.cache[modulePath] = mockModule;
};

installMock(googleapisPath, mockGoogleApis);
delete require.cache[middlewarePath];

const verifyGooglePubSub = require(middlewarePath);

const createRequest = (authorization = "Bearer test-id-token") => ({
  headers: {
    authorization,
  },
});

const createResponse = () => ({
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
});

beforeEach(() => {
  process.env.GOOGLE_PUBSUB_OIDC_AUDIENCE =
    "https://spendwise.example.com/api/subscriptions/google/rtdn";

  process.env.GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL =
    "spendwise-rtdn-push@prd0011.iam.gserviceaccount.com";

  payload = {
    iss: "https://accounts.google.com",
    email: "spendwise-rtdn-push@prd0011.iam.gserviceaccount.com",
    email_verified: true,
  };

  verificationError = null;
  verificationCalls = [];
});

test("accepts a valid Google Pub/Sub identity", async () => {
  const req = createRequest();
  const res = createResponse();
  let nextCalled = false;

  await verifyGooglePubSub(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.pubsubAuth.email, payload.email);
  assert.equal(res.statusCode, null);

  assert.deepEqual(verificationCalls, [
    {
      idToken: "test-id-token",
      audience: process.env.GOOGLE_PUBSUB_OIDC_AUDIENCE,
    },
  ]);
});

test("returns 503 when authentication configuration is missing", async () => {
  delete process.env.GOOGLE_PUBSUB_OIDC_AUDIENCE;

  const req = createRequest();
  const res = createResponse();
  let nextCalled = false;

  await verifyGooglePubSub(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 503);
  assert.equal(nextCalled, false);
  assert.equal(verificationCalls.length, 0);
});

test("returns 401 when the authorization header is missing", async () => {
  const req = createRequest(undefined);
  delete req.headers.authorization;

  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(verificationCalls.length, 0);
});

test("returns 401 when the Bearer token is empty", async () => {
  const req = createRequest("Bearer ");
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(verificationCalls.length, 0);
});

test("rejects an identity with the wrong email", async () => {
  payload.email = "another-service@prd0011.iam.gserviceaccount.com";

  const req = createRequest();
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 403);
});

test("rejects an identity with an unverified email", async () => {
  payload.email_verified = false;

  const req = createRequest();
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 403);
});

test("rejects an identity with the wrong issuer", async () => {
  payload.iss = "https://example.com";

  const req = createRequest();
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 403);
});

test("returns 401 for an invalid ID token", async () => {
  verificationError = new Error("Invalid token");

  const req = createRequest();
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 401);
});

test("returns 503 when Google's verification service is unavailable", async () => {
  verificationError = Object.assign(
    new Error("Google authentication service unavailable"),
    { code: "ECONNRESET" },
  );

  const req = createRequest();
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 503);
});

test("returns 503 for an upstream Google server error", async () => {
  verificationError = Object.assign(new Error("Google server error"), {
    response: { status: 503 },
  });

  const req = createRequest();
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 503);
});

test("rejects a token intended for a different audience", async () => {
  verificationError = new Error("Wrong audience");

  const req = createRequest();
  const res = createResponse();

  await verifyGooglePubSub(req, res, () => {});

  assert.equal(res.statusCode, 401);
});
