const jwt = require('jsonwebtoken');

// Generate JWT Token
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate Refresh Token
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// Verify Refresh Token
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res) => {
  try {
    // Generate tokens (use user.id for SQL, not user._id)
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Handle both Sequelize model instances and plain objects
    let userData;
    if (typeof user.toJSON === 'function') {
      // If it's a Sequelize model instance
      userData = user.toJSON();
    } else {
      // If it's a plain object, create a copy without the password
      const { password, ...userWithoutPassword } = user;
      userData = userWithoutPassword;
    }

    // Remove password if it exists
    if (userData.password) {
      delete userData.password;
    }

    res.status(statusCode).json({
      success: true,
      token,
      refreshToken,
      user: userData
    });
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating authentication tokens'
    });
  }
};
