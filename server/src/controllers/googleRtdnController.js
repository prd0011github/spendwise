const EXPECTED_PACKAGE_NAME = "com.pradeepsingh.spendwise";

const {
  processGoogleSubscriptionNotification,
} = require("../services/googleRtdnSubscriptionService");

const {
  processGoogleVoidedPurchaseNotification,
} = require("../services/googleRtdnVoidedPurchaseService");

const {
  claimRtdnEvent,
  completeRtdnEvent,
  releaseRtdnEvent,
} = require("../services/googleRtdnEventService");

const googleRtdnController = async (req, res) => {
  const message = req.body?.message;

  if (
    !message ||
    typeof message.data !== "string" ||
    typeof message.messageId !== "string" ||
    !message.messageId.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid Pub/Sub message envelope",
    });
  }

  let notification;

  try {
    const decodedData = Buffer.from(message.data, "base64").toString("utf8");
    notification = JSON.parse(decodedData);
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid RTDN notification payload",
    });
  }

  if (!notification || notification.packageName !== EXPECTED_PACKAGE_NAME) {
    return res.status(400).json({
      success: false,
      message: "Invalid Android package name",
    });
  }

  const messageId = message.messageId.trim();

  if (notification.testNotification) {
    console.log("Google Play RTDN test notification received:", {
      messageId,
      packageName: notification.packageName,
    });

    return res.status(204).send();
  }

  const subscriptionNotification = notification.subscriptionNotification;

  const voidedPurchaseNotification = notification.voidedPurchaseNotification;

  if (
    Boolean(subscriptionNotification) === Boolean(voidedPurchaseNotification)
  ) {
    return res.status(400).json({
      success: false,
      message: "Unsupported or ambiguous RTDN notification type",
    });
  }

  // Voided purchases require separate verification before access
  // can safely be revoked. Do not acknowledge these events yet.
  if (
    voidedPurchaseNotification &&
    (typeof voidedPurchaseNotification.purchaseToken !== "string" ||
      !voidedPurchaseNotification.purchaseToken.trim() ||
      typeof voidedPurchaseNotification.orderId !== "string" ||
      !voidedPurchaseNotification.orderId.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "Voided purchase token or order ID is missing",
    });
  }

  const purchaseToken = subscriptionNotification
    ? subscriptionNotification.purchaseToken
    : voidedPurchaseNotification.purchaseToken;

  if (typeof purchaseToken !== "string" || !purchaseToken.trim()) {
    return res.status(400).json({
      success: false,
      message: "Subscription purchase token is missing",
    });
  }

  let claim;

  try {
    claim = await claimRtdnEvent(messageId);

    if (claim.completed) {
      return res.status(204).send();
    }

    if (!claim.claimed) {
      return res.status(503).json({
        success: false,
        message: "RTDN event is currently being processed",
      });
    }

    const result = subscriptionNotification
      ? await processGoogleSubscriptionNotification(purchaseToken)
      : await processGoogleVoidedPurchaseNotification({
          purchaseToken,
          orderId: voidedPurchaseNotification.orderId,
          refundType: voidedPurchaseNotification.refundType,
        });

    const completed = await completeRtdnEvent(messageId, claim.lockToken);

    if (!completed) {
      throw new Error("Unable to complete RTDN event; processing lease lost");
    }

    console.log("Google Play RTDN subscription processed:", {
      messageId,
      packageName: notification.packageName,
      processed: result.processed,
      reason: result.reason || null,
      status: result.status || null,
      plan: result.plan || null,
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Google RTDN subscription processing failed:", {
      messageId,
      error: error.message,
    });

    if (claim?.claimed) {
      try {
        await releaseRtdnEvent(messageId, claim.lockToken);
      } catch (releaseError) {
        console.error("Unable to release RTDN event:", {
          messageId,
          error: releaseError.message,
        });
      }
    }

    // Pub/Sub should retry transient processing failures.
    return res.status(503).json({
      success: false,
      message: "Unable to process RTDN notification",
    });
  }
};

module.exports = {
  googleRtdnController,
};
