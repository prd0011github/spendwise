const mongoose = require("mongoose");

const getHealthStatus = () => {
  return {
    success: true,
    message: "SpendWise API is running",
  };
};

const getReadinessStatus = () => {
  const databaseConnected = mongoose.connection.readyState === 1;

  return {
    success: databaseConnected,
    status: databaseConnected ? "ready" : "not_ready",
    checks: {
      database: databaseConnected ? "connected" : "disconnected",
    },
  };
};

module.exports = {
  getHealthStatus,
  getReadinessStatus,
};
