const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../services/authService");

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register user error:", error.message);

    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { token, user } = await loginUser(req.body);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Login user error:", error.message);

    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await getCurrentUser(req.userId);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
