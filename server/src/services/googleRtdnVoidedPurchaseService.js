const crypto = require("crypto");
const User = require("../models/User");

const {
  verifyVoidedPurchase,
  verifySubscriptionByPurchaseToken,
} = require("./googlePlayService");

const hashPurchaseToken = (purchaseToken) =>
  crypto.createHash("sha256").update(purchaseToken).digest("hex");

const createUpdateConflictError = () =>
  Object.assign(
    new Error(
      "Subscription changed during voided-purchase processing. Retry the notification.",
    ),
    {
      statusCode: 503,
      code: "SUBSCRIPTION_UPDATE_CONFLICT",
    },
  );

const processGoogleVoidedPurchaseNotification = async ({
  purchaseToken,
  orderId,
  refundType,
}) => {
  if (typeof purchaseToken !== "string" || !purchaseToken.trim()) {
    throw new Error("Voided purchase token is missing");
  }

  if (typeof orderId !== "string" || !orderId.trim()) {
    throw new Error("Voided purchase order ID is missing");
  }

  const voidedPurchase = await verifyVoidedPurchase({
    purchaseToken,
    orderId,
  });

  if (!voidedPurchase.verified) {
    return {
      processed: false,
      reason: "voided_purchase_not_verified",
    };
  }

  const isPartialRefund = voidedPurchase.isPartialRefund || refundType === 2;

  if (isPartialRefund) {
    return {
      processed: true,
      revoked: false,
      reason: "partial_refund",
    };
  }

  const purchaseTokenHash = hashPurchaseToken(purchaseToken);

  const user = await User.findOne({
    "subscription.purchaseTokenHash": purchaseTokenHash,
  }).select("+subscription.purchaseTokenHash");

  if (!user) {
    return {
      processed: false,
      reason: "purchase_not_linked",
    };
  }

  if (user.subscription?.billingProvider !== "google_play") {
    return {
      processed: false,
      reason: "different_billing_provider",
    };
  }

  const currentSubscription =
    await verifySubscriptionByPurchaseToken(purchaseToken);

  if (currentSubscription.status === "active") {
    return {
      processed: true,
      revoked: false,
      reason: "subscription_still_active",
    };
  }

  if (
    !currentSubscription.latestSuccessfulOrderId ||
    currentSubscription.latestSuccessfulOrderId !== orderId
  ) {
    return {
      processed: true,
      revoked: false,
      reason: "voided_order_is_not_current_order",
    };
  }

  const currentRevision = user.subscription?.revision ?? 0;

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      "subscription.billingProvider": "google_play",
      "subscription.purchaseTokenHash": purchaseTokenHash,
      $or: [
        { "subscription.revision": currentRevision },
        { "subscription.revision": { $exists: false } },
      ],
    },
    {
      $set: {
        "subscription.plan": "free",
        "subscription.status": currentSubscription.status,
        "subscription.expiresAt": currentSubscription.expiresAt,
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

  if (!updatedUser) {
    throw createUpdateConflictError();
  }

  return {
    processed: true,
    revoked: true,
    reason: "current_subscription_fully_refunded",
    status: updatedUser.subscription.status,
    plan: updatedUser.subscription.plan,
  };
};

module.exports = {
  processGoogleVoidedPurchaseNotification,
};
