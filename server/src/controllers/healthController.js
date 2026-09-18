const { getHealthStatus } = require("../services/healthService");

const getHealth = (req, res) => {
  const healthStatus = getHealthStatus();
  res.status(200).json(healthStatus);
};

module.exports = {
  getHealth,
};
