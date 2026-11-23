const { rateLimit } = require("express-rate-limit");

const createRateLimiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) => req.path === "/subscriptions/google/rtdn",

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const loginLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again after 15 minutes.",
);

const registerLimiter = createRateLimiter(
  60 * 60 * 1000,
  5,
  "Too many registration attempts. Please try again later.",
);

const forgotPasswordLimiter = createRateLimiter(
  60 * 60 * 1000,
  5,
  "Too many password reset requests. Please try again later.",
);

const resetPasswordLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many password reset attempts. Please try again later.",
);

module.exports = {
  generalApiLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};
