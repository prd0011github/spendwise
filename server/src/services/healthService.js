const getHealthStatus = () => {
  return {
    success: true,
    message: "SpendWise API is running",
  };
};

module.exports = {
  getHealthStatus,
};
