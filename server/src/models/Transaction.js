const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Transaction name is required"],
      trim: true,
      minlength: [2, "Transaction name must be at least 2 characters"],
    },

    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0.01, "Transaction amount must be greater than 0"],
    },

    category: {
      type: String,
      required: true,
      default: "Other",
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Transaction date is required"],
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
