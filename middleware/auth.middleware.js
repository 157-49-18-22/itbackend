const jwt = require('jsonwebtoken');
const { User } = require('../models/sql');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (req.user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Your account is inactive. Please contact admin.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      console.log('Authorization check for route:', req.originalUrl);
      console.log('User making request:', req.user);
      
      // Ensure req.user and req.user.role exist and are valid
      if (!req.user || !req.user.role) {
        console.log('No user or role found in request');
        return res.status(403).json({
          success: false,
          message: 'No role assigned. Access denied.'
        });
      }

      // Convert both the user's role and the allowed roles to lowercase for case-insensitive comparison
      const userRole = String(req.user.role).toLowerCase().trim();
      const allowedRoles = roles.map(role => String(role).toLowerCase().trim());
      
      console.log('User role:', req.user.role);
      console.log('Normalized user role:', userRole);
      console.log('Allowed roles from route:', roles);
      console.log('Normalized allowed roles:', allowedRoles);
      
      // Check if user has any of the allowed roles
      const hasPermission = allowedRoles.some(role => 
        role.toLowerCase() === userRole.toLowerCase()
      );
      
      console.log('Has permission:', hasPermission);
      
      if (!hasPermission) {
        console.log(`Access denied for role: ${req.user.role}. Required roles:`, allowedRoles);
        return res.status(403).json({
          success: false,
          message: `User role '${req.user.role}' is not authorized to access this route.`,
          details: {
            userRole: req.user.role,
            normalizedUserRole: userRole,
            requiredRoles: allowedRoles
          }
        });
      }
      
      console.log('Access granted');
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing authorization',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
      } catch (error) {
        // Token invalid, but continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
