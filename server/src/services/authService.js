const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const User = require("../models/User");

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;

    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;

    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;

    throw error;
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;

    throw error;
  }

  return user;
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;

    throw error;
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isCurrentPasswordValid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 401;

    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error(
      "New password must be different from the current password",
    );
    error.statusCode = 400;

    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();
};

const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;

    throw error;
  }

  await Transaction.deleteMany({ userId });

  await Budget.deleteMany({ userId });

  await User.deleteOne({
    _id: userId,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  changeUserPassword,
  deleteUserAccount,
};
