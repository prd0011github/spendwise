const { test } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const modelPath = require.resolve("../src/models/GoogleRtdnEvent");
const records = new Map();

const clone = (value) => structuredClone(value);

const matches = (record, filter) => {
  if (filter.messageId && record.messageId !== filter.messageId) {
    return false;
  }

  if (filter.status && record.status !== filter.status) {
    return false;
  }

  if (filter.lockToken && record.lockToken !== filter.lockToken) {
    return false;
  }

  if (filter.$or) {
    return filter.$or.some((condition) => {
      if (condition.leaseUntil === null) {
        return record.leaseUntil === null;
      }

      if (condition.leaseUntil?.$lte) {
        return (
          record.leaseUntil instanceof Date &&
          record.leaseUntil <= condition.leaseUntil.$lte
        );
      }

      return false;
    });
  }

  return true;
};

const mockModel = {
  findOneAndUpdate: async (filter, update, options = {}) => {
    const existing = records.get(filter.messageId);

    if (existing && !matches(existing, filter)) {
      if (options.upsert) {
        const error = new Error("Duplicate key");
        error.code = 11000;
        throw error;
      }

      return null;
    }

    if (!existing && !options.upsert) {
      return null;
    }

    const record = existing || {
      messageId: filter.messageId,
      status: "processing",
      lockToken: null,
      leaseUntil: null,
      completedAt: null,
    };

    Object.assign(record, update.$setOnInsert || {});
    Object.assign(record, update.$set || {});

    records.set(record.messageId, record);

    return clone(record);
  },

  findOne: (filter) => ({
    lean: async () => {
      const record = records.get(filter.messageId);
      return record ? clone(record) : null;
    },
  }),
};

const mockModule = new Module(modelPath);
mockModule.filename = modelPath;
mockModule.loaded = true;
mockModule.exports = mockModel;
require.cache[modelPath] = mockModule;

const {
  claimRtdnEvent,
  completeRtdnEvent,
  releaseRtdnEvent,
} = require("../src/services/googleRtdnEventService");

test("first delivery successfully claims an event", async () => {
  records.clear();

  const result = await claimRtdnEvent("message-1");

  assert.equal(result.claimed, true);
  assert.ok(result.lockToken);
  assert.equal(result.event.status, "processing");
});

test("duplicate delivery cannot claim an active event", async () => {
  records.clear();

  await claimRtdnEvent("message-2");

  const duplicate = await claimRtdnEvent("message-2");

  assert.equal(duplicate.claimed, false);
  assert.equal(duplicate.busy, true);
});

test("completed event is recognized as a duplicate", async () => {
  records.clear();

  const first = await claimRtdnEvent("message-3");

  const completed = await completeRtdnEvent(
    "message-3",
    first.lockToken,
  );

  assert.equal(completed, true);

  const duplicate = await claimRtdnEvent("message-3");

  assert.equal(duplicate.claimed, false);
  assert.equal(duplicate.completed, true);
});

test("expired lease can be reclaimed by another worker", async () => {
  records.clear();

  const first = await claimRtdnEvent("message-4");

  records.get("message-4").leaseUntil = new Date(Date.now() - 1000);

  const second = await claimRtdnEvent("message-4");

  assert.equal(second.claimed, true);
  assert.notEqual(first.lockToken, second.lockToken);
});

test("old worker cannot complete an event after lease is reclaimed", async () => {
  records.clear();

  const first = await claimRtdnEvent("message-5");

  records.get("message-5").leaseUntil = new Date(Date.now() - 1000);

  const second = await claimRtdnEvent("message-5");

  const oldWorkerResult = await completeRtdnEvent(
    "message-5",
    first.lockToken,
  );

  const newWorkerResult = await completeRtdnEvent(
    "message-5",
    second.lockToken,
  );

  assert.equal(oldWorkerResult, false);
  assert.equal(newWorkerResult, true);
});

test("released event can be claimed again", async () => {
  records.clear();

  const first = await claimRtdnEvent("message-6");

  const released = await releaseRtdnEvent(
    "message-6",
    first.lockToken,
  );

  assert.equal(released, true);

  const second = await claimRtdnEvent("message-6");

  assert.equal(second.claimed, true);
  assert.notEqual(first.lockToken, second.lockToken);
});

test("old worker cannot release a reclaimed event", async () => {
  records.clear();

  const first = await claimRtdnEvent("message-7");

  records.get("message-7").leaseUntil = new Date(Date.now() - 1000);

  const second = await claimRtdnEvent("message-7");

  const oldWorkerResult = await releaseRtdnEvent(
    "message-7",
    first.lockToken,
  );

  assert.equal(oldWorkerResult, false);
  assert.equal(records.get("message-7").lockToken, second.lockToken);
});
