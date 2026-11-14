const { test } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const authServicePath = require.resolve("../src/services/authService");

let getCurrentUserImplementation;

const authServiceMock = new Module(authServicePath);
authServiceMock.filename = authServicePath;
authServiceMock.loaded = true;
authServiceMock.exports = {
  getCurrentUser: (...args) => getCurrentUserImplementation(...args),
};

require.cache[authServicePath] = authServiceMock;

const { getMe } = require("../src/controllers/authController");

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

const callGetMe = async (subscription) => {
  getCurrentUserImplementation = async () => ({
    _id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    subscription,
  });

  const req = { userId: "test-user-id" };
  const res = createResponse();

  await getMe(req, res);

  return res;
};

test("active Pro subscription with future expiry receives Pro access", async () => {
  const res = await callGetMe({
    plan: "pro",
    status: "active",
    expiresAt: new Date(Date.now() + 86400000),
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.subscription.plan, "pro");
  assert.equal(res.body.data.subscription.status, "active");
});

test("expired Pro subscription receives Free access", async () => {
  const res = await callGetMe({
    plan: "pro",
    status: "active",
    expiresAt: new Date(Date.now() - 86400000),
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.subscription.plan, "free");
  assert.equal(res.body.data.subscription.status, "expired");
});

test("Free user remains on Free plan", async () => {
  const res = await callGetMe({
    plan: "free",
    status: "inactive",
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.subscription.plan, "free");
  assert.equal(res.body.data.subscription.status, "inactive");
});

test("Pending Pro subscription does not receive Pro access", async () => {
  const res = await callGetMe({
    plan: "pro",
    status: "pending",
    expiresAt: new Date(Date.now() + 86400000),
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.subscription.plan, "free");
  assert.equal(res.body.data.subscription.status, "pending");
});
