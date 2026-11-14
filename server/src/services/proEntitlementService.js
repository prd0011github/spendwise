const isProEntitled = (subscription) => {
  if (!subscription || subscription.plan !== "pro") {
    return false;
  }

  if (subscription.status !== "active") {
    return false;
  }

  if (!subscription.expiresAt) {
    return false;
  }

  const expiryTimestamp = new Date(subscription.expiresAt).getTime();

  if (!Number.isFinite(expiryTimestamp)) {
    return false;
  }

  return expiryTimestamp > Date.now();
};

module.exports = {
  isProEntitled,
};
