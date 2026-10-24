const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["inactive", "active", "expired", "cancelled", "pending"],
        default: "inactive",
      },
      billingProvider: {
        type: String,
        enum: ["google_play", "apple", "web", null],
        default: null,
      },
      productId: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
