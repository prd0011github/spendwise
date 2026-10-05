const {
  getBudget,
  createOrUpdateBudget,
} = require("../services/budgetService");

const isValidMonth = (month) => {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
};

const getCurrentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getBudgetForMonth = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || !isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: "Valid month in YYYY-MM format is required",
      });
    }

    const budget = await getBudget(req.userId, month);

    if (!budget) {
      return res.status(200).json({
        success: true,
        budget: null,
      });
    }

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    console.error("Get budget error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch budget",
    });
  }
};

const saveBudgetForMonth = async (req, res) => {
  try {
    const { month, budget } = req.body;

    if (!month || !isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: "Valid month in YYYY-MM format is required",
      });
    }

    if (budget === undefined || budget === null || Number(budget) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be greater than 0",
      });
    }

    const currentMonth = getCurrentMonth();

    if (month !== currentMonth) {
      return res.status(400).json({
        success: false,
        message: "Budget can only be created or updated for the current month",
      });
    }

    const savedBudget = await createOrUpdateBudget(
      req.userId,
      month,
      Number(budget),
    );

    res.status(200).json({
      success: true,
      budget: savedBudget,
    });
  } catch (error) {
    console.error("Save budget error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to save budget",
    });
  }
};

module.exports = {
  getBudgetForMonth,
  saveBudgetForMonth,
};
