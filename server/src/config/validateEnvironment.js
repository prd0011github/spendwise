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
};

module.exports = validateEnvironment;
