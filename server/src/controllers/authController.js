const { registerUser } = require("../services/authService");

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

module.exports = {
  register,
};
