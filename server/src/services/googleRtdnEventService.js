const crypto = require("crypto");
const GoogleRtdnEvent = require("../models/GoogleRtdnEvent");

const EVENT_LEASE_MS = 5 * 60 * 1000;

const claimRtdnEvent = async (messageId) => {
  const now = new Date();
  const lockToken = crypto.randomUUID();
  const leaseUntil = new Date(now.getTime() + EVENT_LEASE_MS);

  try {
    const event = await GoogleRtdnEvent.findOneAndUpdate(
      {
        messageId,
        status: "processing",
        $or: [{ leaseUntil: { $lte: now } }, { leaseUntil: null }],
      },
      {
        $set: {
          status: "processing",
          lockToken,
          leaseUntil,
        },
        $setOnInsert: {
          messageId,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return {
      claimed: true,
      lockToken,
      event,
    };
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    const existingEvent = await GoogleRtdnEvent.findOne({
      messageId,
    }).lean();

    if (existingEvent?.status === "completed") {
      return {
        claimed: false,
        completed: true,
      };
    }

    return {
      claimed: false,
      busy: true,
    };
  }
};

const completeRtdnEvent = async (messageId, lockToken) => {
  const result = await GoogleRtdnEvent.findOneAndUpdate(
    {
      messageId,
      status: "processing",
      lockToken,
    },
    {
      $set: {
        status: "completed",
        completedAt: new Date(),
        leaseUntil: null,
        lockToken: null,
      },
    },
    {
      returnDocument: "after",
    },
  );

  return Boolean(result);
};

const releaseRtdnEvent = async (messageId, lockToken) => {
  const result = await GoogleRtdnEvent.findOneAndUpdate(
    {
      messageId,
      status: "processing",
      lockToken,
    },
    {
      $set: {
        leaseUntil: new Date(),
        lockToken: null,
      },
    },
    {
      returnDocument: "after",
    },
  );

  return Boolean(result);
};

module.exports = {
  claimRtdnEvent,
  completeRtdnEvent,
  releaseRtdnEvent,
};
