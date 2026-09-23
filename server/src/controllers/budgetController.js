const { getBudget, setBudget } = require("../services/budgetService");

const getBudgetAmount = async (req, res) => {
  try {
    const budget = await getBudget(req.userId);

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error("Get budget error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch budget",
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { budget } = req.body;

    const updatedBudget = await setBudget(req.userId, budget);

    res.status(200).json({
      success: true,
      data: updatedBudget,
    });
  } catch (error) {
    console.error("Update budget error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid budget amount",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update budget",
    });
  }
};

module.exports = {
  getBudgetAmount,
  updateBudget,
};
