const User = require("../models/User");
const { isProEntitled } = require("../services/proEntitlementService");

const requirePro = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("subscription");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!isProEntitled(user.subscription)) {
      return res.status(403).json({
        success: false,
        message: "An active SpendWise Pro subscription is required",
        code: "PRO_REQUIRED",
      });
    }

    next();
  } catch (error) {
    console.error("Pro authorization error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify Pro subscription",
    });
  }
};

module.exports = requirePro;
