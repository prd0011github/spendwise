const crypto = require("crypto");
const User = require("../models/User");
const {
  verifySubscription,
  acknowledgeSubscription,
} = require("../services/googlePlayService");

const verifyGoogleSubscription = async (req, res) => {
  try {
    const { productId, purchaseToken } = req.body;

    if (!productId || !purchaseToken) {
      return res.status(400).json({
        success: false,
        message: "Product ID and purchase token are required",
      });
    }

    const verified = await verifySubscription({
      productId,
      purchaseToken,
    });

    if (verified.status !== "active") {
      return res.status(402).json({
        success: false,
        message: "Google Play has not confirmed an active subscription",
        data: {
          status: verified.status,
          expiresAt: verified.expiresAt,
        },
      });
    }

    const purchaseTokenHash = crypto
      .createHash("sha256")
      .update(purchaseToken)
      .digest("hex");

    // Prevent a purchase token from being linked to another account.
    const existingOwner = await User.findOne({
      "subscription.purchaseTokenHash": purchaseTokenHash,
    }).select("+subscription.purchaseTokenHash");

    if (
      existingOwner &&
      existingOwner._id.toString() !== req.userId.toString()
    ) {
      return res.status(409).json({
        success: false,
        message: "This purchase is already linked to another account",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Do not overwrite a subscription belonging to another provider.
    if (
      user.subscription?.billingProvider &&
      user.subscription.billingProvider !== "google_play"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An active subscription from another billing provider already exists",
      });
    }

    const currentRevision = user.subscription?.revision ?? 0;

    // Atomically update the subscription only if it has not changed
    // since it was read. Also support older documents without revision.
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.userId,
        $and: [
          {
            $or: [
              { "subscription.revision": currentRevision },
              { "subscription.revision": { $exists: false } },
            ],
          },
          {
            $or: [
              { "subscription.billingProvider": "google_play" },
              { "subscription.billingProvider": null },
              { "subscription.billingProvider": { $exists: false } },
            ],
          },
        ],
      },
      {
        $set: {
          "subscription.plan": "pro",
          "subscription.status": "active",
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

    if (!updatedUser) {
      return res.status(409).json({
        success: false,
        message: "Subscription changed during verification. Please try again.",
      });
    }

    let acknowledgementPending = false;

    if (
      verified.acknowledgementState !== "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED"
    ) {
      try {
        await acknowledgeSubscription({
          productId: verified.productId,
          purchaseToken,
        });
      } catch (acknowledgementError) {
        acknowledgementPending = true;

        console.error(
          "Google Play purchase acknowledgement failed:",
          acknowledgementError.message,
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "SpendWise Pro subscription verified",
      data: {
        plan: updatedUser.subscription.plan,
        status: updatedUser.subscription.status,
        productId: updatedUser.subscription.productId,
        expiresAt: updatedUser.subscription.expiresAt,
        acknowledgementPending,
      },
    });
  } catch (error) {
    console.error(
      "Google Play subscription verification failed:",
      error.message,
    );

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This purchase is already linked to another account",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to verify the Google Play subscription right now",
    });
  }
};

module.exports = {
  verifyGoogleSubscription,
};
