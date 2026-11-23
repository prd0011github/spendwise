const crypto = require("crypto");
const User = require("../models/User");
const { verifySubscriptionByPurchaseToken } = require("./googlePlayService");

const hashPurchaseToken = (purchaseToken) =>
  crypto.createHash("sha256").update(purchaseToken).digest("hex");

const createUpdateConflictError = () =>
  Object.assign(
    new Error(
      "Subscription changed during RTDN processing. Retry the notification.",
    ),
    {
      statusCode: 503,
      code: "SUBSCRIPTION_UPDATE_CONFLICT",
    },
  );

const processGoogleSubscriptionNotification = async (purchaseToken) => {
  if (typeof purchaseToken !== "string" || !purchaseToken.trim()) {
    throw new Error("RTDN purchase token is missing");
  }

  // Always verify the latest subscription state with Google Play.
  const verified = await verifySubscriptionByPurchaseToken(purchaseToken);

  const purchaseTokenHash = hashPurchaseToken(purchaseToken);

  let user = await User.findOne({
    "subscription.purchaseTokenHash": purchaseTokenHash,
  }).select("+subscription.purchaseTokenHash");

  // If Google confirms a replacement, locate the existing owner
  // through the verified linked purchase token.
  if (!user && verified.linkedPurchaseToken) {
    const linkedTokenHash = hashPurchaseToken(verified.linkedPurchaseToken);

    user = await User.findOne({
      "subscription.purchaseTokenHash": linkedTokenHash,
      "subscription.billingProvider": "google_play",
    }).select("+subscription.purchaseTokenHash");
  }

  // RTDN must never create or independently link a user account.
  if (!user) {
    return {
      processed: false,
      reason: "purchase_not_linked",
    };
  }

  // Do not overwrite subscriptions belonging to another provider.
  if (user.subscription?.billingProvider !== "google_play") {
    return {
      processed: false,
      reason: "different_billing_provider",
    };
  }

  // Capture the token currently linked to this user.
  // This is either the incoming token or its verified predecessor.
  const currentPurchaseTokenHash = user.subscription?.purchaseTokenHash;

  if (!currentPurchaseTokenHash) {
    return {
      processed: false,
      reason: "purchase_not_linked",
    };
  }

  const currentRevision = user.subscription?.revision ?? 0;

  const isActive =
    verified.status === "active" &&
    verified.expiresAt instanceof Date &&
    !Number.isNaN(verified.expiresAt.getTime()) &&
    verified.expiresAt.getTime() > Date.now();

  // Only update if the subscription revision and currently linked
  // purchase token are still the same as when the user was read.
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      "subscription.billingProvider": "google_play",
      "subscription.purchaseTokenHash": currentPurchaseTokenHash,
      $or: [
        { "subscription.revision": currentRevision },
        { "subscription.revision": { $exists: false } },
      ],
    },
    {
      $set: {
        "subscription.plan": isActive ? "pro" : "free",
        "subscription.status": verified.status,
        "subscription.billingProvider": "google_play",
        "subscription.productId": verified.productId,
        "subscription.purchaseTokenHash": purchaseTokenHash,
        "subscription.expiresAt": verified.expiresAt,
      },
      $inc: {
        "subscription.revision": 1,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // A concurrent update occurred, or the token was replaced.
  // Let the notification delivery retry instead of silently
  // overwriting a newer subscription state.
  if (!updatedUser) {
    throw createUpdateConflictError();
  }

  return {
    processed: true,
    status: updatedUser.subscription.status,
    plan: updatedUser.subscription.plan,
  };
};

module.exports = {
  processGoogleSubscriptionNotification,
};
