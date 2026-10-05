const Budget = require("../models/Budget");

const getBudget = async (userId, month) => {
  return Budget.findOne({
    userId,
    month,
  });
};

const createOrUpdateBudget = async (userId, month, budgetAmount) => {
  return Budget.findOneAndUpdate(
    {
      userId,
      month,
    },
    {
      userId,
      month,
      budget: budgetAmount,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );
};

module.exports = {
  getBudget,
  createOrUpdateBudget,
};
