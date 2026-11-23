require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/User");
const GoogleRtdnEvent = require("../src/models/GoogleRtdnEvent");

const EXPECTED_INDEXES = {
  subscriptionToken: "unique_subscription_purchase_token_hash",
  rtdnMessageId: "messageId_1",
  rtdnTtl: "google_rtdn_completed_events_ttl",
};

const inspectIndex = (indexes, name) =>
  indexes.find((index) => index.name === name) || null;

const verifySubscriptionIndexes = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    // Prevent Mongoose from automatically creating indexes.
    await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false,
      autoCreate: false,
    });

    console.log("\nConnected to MongoDB.");
    console.log("Running read-only index verification...\n");

    const [userIndexes, eventIndexes] = await Promise.all([
      User.collection.indexes(),
      GoogleRtdnEvent.collection.indexes(),
    ]);

    const tokenIndex = inspectIndex(
      userIndexes,
      EXPECTED_INDEXES.subscriptionToken,
    );

    const messageIdIndex = inspectIndex(
      eventIndexes,
      EXPECTED_INDEXES.rtdnMessageId,
    );

    const ttlIndex = inspectIndex(eventIndexes, EXPECTED_INDEXES.rtdnTtl);

    const duplicateTokenGroups = await User.collection
      .aggregate([
        {
          $match: {
            "subscription.purchaseTokenHash": {
              $type: "string",
              $gt: "",
            },
          },
        },
        {
          $group: {
            _id: "$subscription.purchaseTokenHash",
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
        {
          $count: "duplicateGroups",
        },
      ])
      .toArray();

    const duplicateGroups = duplicateTokenGroups[0]?.duplicateGroups || 0;

    const results = {
      subscriptionTokenIndex: {
        found: Boolean(tokenIndex),
        unique: tokenIndex?.unique === true,
        partialFilterExpression: tokenIndex?.partialFilterExpression || null,
      },
      rtdnMessageIdIndex: {
        found: Boolean(messageIdIndex),
        unique: messageIdIndex?.unique === true,
      },
      rtdnTtlIndex: {
        found: Boolean(ttlIndex),
        expireAfterSeconds: ttlIndex?.expireAfterSeconds ?? null,
        partialFilterExpression: ttlIndex?.partialFilterExpression || null,
      },
      duplicateSubscriptionTokenGroups: duplicateGroups,
    };

    console.log(JSON.stringify(results, null, 2));

    const allIndexesValid =
      results.subscriptionTokenIndex.found &&
      results.subscriptionTokenIndex.unique &&
      results.rtdnMessageIdIndex.found &&
      results.rtdnMessageIdIndex.unique &&
      results.rtdnTtlIndex.found &&
      results.rtdnTtlIndex.expireAfterSeconds === 2592000 &&
      duplicateGroups === 0;

    console.log(
      allIndexesValid
        ? "\nAll expected indexes are present."
        : "\nSome checks need attention. No database changes were made.",
    );

    if (!allIndexesValid) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nVerification failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

verifySubscriptionIndexes();
