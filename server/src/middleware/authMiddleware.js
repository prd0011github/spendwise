const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded.userId || !Number.isInteger(decoded.tokenVersion)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }

    const user = await User.findById(decoded.userId).select("tokenVersion");

    if (!user || (user.tokenVersion ?? 0) !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    req.userId = user._id.toString();

    next();
  } catch (error) {
    if (
      error.name !== "JsonWebTokenError" &&
      error.name !== "TokenExpiredError"
    ) {
      console.error("Authentication error:", error.message);
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = authenticate;
