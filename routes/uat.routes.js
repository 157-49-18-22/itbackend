const express = require('express');
const router = express.Router();
const uatController = require('../controllers/uat.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(protect);

// Helper function to check admin access
const checkAdminAccess = (req, res, next) => {
  // If user is admin (case-insensitive), allow access
  if (req.user && req.user.role && 
      req.user.role.toString().toLowerCase() === 'admin') {
    return next();
  }
  // Otherwise, use the regular authorize middleware
  return authorize(['tester', 'project_manager'])(req, res, next);
};

// Create a new UAT test case
router.post('/', 
  checkAdminAccess,
  uatController.createUAT
);

// Get all UAT test cases
router.get('/', uatController.getAllUATs);

// Get a single UAT test case by ID
router.get('/:id', uatController.getUATById);

// Update a UAT test case
router.put('/:id', 
  checkAdminAccess,
  uatController.updateUAT
);

// Delete a UAT test case
router.delete('/:id', 
  (req, res, next) => {
    // Allow admin or project manager
    if (req.user && req.user.role && 
        (req.user.role.toString().toLowerCase() === 'admin' || 
         req.user.role.toString().toLowerCase() === 'project_manager')) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Not authorized to perform this action'
    });
  },
  uatController.deleteUAT
);

// Update UAT status
router.patch('/:id/status', 
  checkAdminAccess,
  uatController.updateUATStatus
);

module.exports = router;
