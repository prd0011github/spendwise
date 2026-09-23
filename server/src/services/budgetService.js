const budget = require("../models/Budget");

const getBudget = async (userId) => {
  const userBudget = await budget.findOne({ userId });

  return userBudget;
};

const setBudget = async (userId, budgetAmount) => {
  const updatedBudget = await budget.findOneAndUpdate(
    { userId },
    { budget: budgetAmount },
    { new: true, upsert: true, runValidators: true },
  );
  return updatedBudget;
};

module.exports = {
  getBudget,
  setBudget,
};
