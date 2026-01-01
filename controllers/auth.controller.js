const { User } = require('../models/sql');
const { sendTokenResponse, verifyRefreshToken, generateToken } = require('../utils/jwt.utils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Developer',
      department: department || 'Development'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('👉 Login Request Body:', req.body);
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    console.log('🔍 Finding user with email:', email);

    // Check for user (Sequelize doesn't hide password by default, we handle it in model)
    // Check for user
    // IMPORTANT: removed raw: true to verify password with instance method
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });

    console.log('👤 User found result:', user ? 'Found' : 'Not Found');

    if (!user) {
      console.log('❌ User not found in DB');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User not found'
      });
    }

    // console.log('🔑 User ID:', user.id); // Debug log

    if (!user) {
      console.log('❌ User not found in DB');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User not found'
      });
    }

    console.log('🔄 Comparing passwords...');
    // Check if password matches using the instance method directly
    let isMatch = await user.comparePassword(password);

    // Fallback: If bcrypt fails, check plain text (for newly added users)
    if (!isMatch && user.password === password) {
      console.log('⚠️  Plain text password match - User should update password');
      isMatch = true;
    }

    console.log('✅ Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      console.log('❌ User inactive');
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact admin.'
      });
    }

    // Update last login
    console.log('🔄 Updating last login...');
    await User.update(
      { lastLogin: new Date() },
      { where: { id: user.id } }
    );

    // Get the updated user data
    const updatedUser = await User.findByPk(user.id);

    console.log('✅ Login successful, sending token...');
    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const newToken = generateToken(user.id);

    res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
