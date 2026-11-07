require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/User");

const createSubscriptionTokenIndex = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    await User.collection.createIndex(
      { "subscription.purchaseTokenHash": 1 },
      {
        unique: true,
        partialFilterExpression: {
          "subscription.purchaseTokenHash": {
            $type: "string",
            $gt: "",
          },
        },
        name: "unique_subscription_purchase_token_hash",
      },
    );

    console.log("Subscription token index created or already exists.");

    const indexes = await User.collection.indexes();

    const index = indexes.find(
      (item) => item.name === "unique_subscription_purchase_token_hash",
    );

    console.log(
      index
        ? {
            name: index.name,
            unique: index.unique,
            partialFilterExpression: index.partialFilterExpression,
          }
        : "Index not found after creation.",
    );
  } catch (error) {
    console.error("Index operation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createSubscriptionTokenIndex();
