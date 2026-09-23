const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },

    budget: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0.01, "Budget amount must be greater than 0"],
    },
  },
  {
    timestamps: true,
  },
);

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
