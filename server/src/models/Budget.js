const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    month: {
      type: String,
      required: [true, "Budget month is required"],
      match: [
        /^\d{4}-(0[1-9]|1[0-2])$/,
        "Budget month must be in YYYY-MM format",
      ],
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

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
