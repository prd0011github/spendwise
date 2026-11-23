const { google } = require("googleapis");

const authClient = new google.auth.OAuth2();

const verifyGooglePubSub = async (req, res, next) => {
  const audience = process.env.GOOGLE_PUBSUB_OIDC_AUDIENCE;
  const expectedEmail = process.env.GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL;

  if (!audience || !expectedEmail) {
    return res.status(503).json({
      success: false,
      message: "Pub/Sub authentication is not configured",
    });
  }

  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Missing Pub/Sub authentication token",
    });
  }

  const idToken = authorization.slice("Bearer ".length).trim();

  if (!idToken) {
    return res.status(401).json({
      success: false,
      message: "Invalid Pub/Sub authentication token",
    });
  }

  try {
    const ticket = await authClient.verifyIdToken({
      idToken,
      audience,
    });

    const payload = ticket.getPayload();

    const validIssuer = [
      "https://accounts.google.com",
      "accounts.google.com",
    ].includes(payload?.iss);

    const validIdentity =
      payload?.email === expectedEmail &&
      payload?.email_verified === true &&
      validIssuer;

    if (!validIdentity) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Pub/Sub identity",
      });
    }

    req.pubsubAuth = {
      email: payload.email,
    };

    return next();
  } catch (error) {
    console.error("Pub/Sub authentication failed:", error.message);

    const statusCode =
      error.code === "ENOTFOUND" ||
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNREFUSED" ||
      (typeof error.code === "number" && error.code >= 500) ||
      error.response?.status >= 500
        ? 503
        : 401;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 503
          ? "Pub/Sub authentication service temporarily unavailable"
          : "Invalid Pub/Sub authentication token",
    });
  }
};

module.exports = verifyGooglePubSub;
