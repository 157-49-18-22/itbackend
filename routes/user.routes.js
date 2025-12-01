const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(protect);

// Apply admin authorization to all routes except getting current user
router.use(authorize('admin'));

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private/Admin
 */
router.post('/', userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put('/:id', userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
