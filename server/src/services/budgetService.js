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
      $set: {
        budget: budgetAmount,
      },
      $setOnInsert: {
        userId,
        month,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    },
  );
};

module.exports = {
  getBudget,
  createOrUpdateBudget,
};
