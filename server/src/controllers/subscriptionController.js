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

    user.subscription = {
      ...(user.subscription || {}),
      plan: "pro",
      status: "active",
      billingProvider: "google_play",
      productId: verified.productId,
      purchaseTokenHash,
      expiresAt: verified.expiresAt,
    };

    await user.save();

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
        plan: user.subscription.plan,
        status: user.subscription.status,
        productId: user.subscription.productId,
        expiresAt: user.subscription.expiresAt,
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

    return res.status(502).json({
      success: false,
      message: "Unable to verify the Google Play subscription right now",
    });
  }
};

module.exports = {
  verifyGoogleSubscription,
};
