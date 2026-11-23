const validateEnvironment = () => {
  const requiredVariables = ["MONGODB_URI", "JWT_SECRET"];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }

  if (Buffer.byteLength(process.env.JWT_SECRET) < 32) {
    throw new Error("JWT_SECRET must be at least 32 bytes long");
  }

  const pubSubVariables = [
    "GOOGLE_PUBSUB_OIDC_AUDIENCE",
    "GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL",
  ];

  const configuredPubSubVariables = pubSubVariables.filter((variable) =>
    Boolean(process.env[variable]?.trim()),
  );

  if (
    configuredPubSubVariables.length !== 0 &&
    configuredPubSubVariables.length !== pubSubVariables.length
  ) {
    throw new Error(
      "GOOGLE_PUBSUB_OIDC_AUDIENCE and GOOGLE_PUBSUB_SERVICE_ACCOUNT_EMAIL must be configured together",
    );
  }
};

module.exports = validateEnvironment;
