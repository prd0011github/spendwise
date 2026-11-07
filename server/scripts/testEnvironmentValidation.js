const assert = require("assert");
const validateEnvironment = require("../src/config/validateEnvironment");

delete process.env.MONGODB_URI;
delete process.env.JWT_SECRET;

assert.throws(
  () => validateEnvironment(),
  /Missing required environment variables/,
);

process.env.MONGODB_URI = "mongodb://localhost/test";
process.env.JWT_SECRET = "short";

assert.throws(
  () => validateEnvironment(),
  /JWT_SECRET must be at least 32 bytes/,
);

process.env.JWT_SECRET = "a".repeat(64);

assert.doesNotThrow(() => validateEnvironment());

console.log("Environment validation tests passed.");
