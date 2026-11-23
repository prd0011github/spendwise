const {
  getHealthStatus,
  getReadinessStatus,
} = require("../services/healthService");

const getHealth = (req, res) => {
  const healthStatus = getHealthStatus();
  res.status(200).json(healthStatus);
};

const getReadiness = (req, res) => {
  const readinessStatus = getReadinessStatus();

  res.status(readinessStatus.success ? 200 : 503).json(readinessStatus);
};

module.exports = {
  getHealth,
  getReadiness,
};
