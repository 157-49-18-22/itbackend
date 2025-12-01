const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/team
 * @desc    Get all team members with department counts
 * @access  Private
 */
router.get('/', teamController.getTeamMembers);

/**
 * @route   POST /api/team
 * @desc    Add a new team member
 * @access  Private/Admin
 */
router.post('/', authorize('admin'), teamController.addTeamMember);

/**
 * @route   PUT /api/team/:id
 * @desc    Update a team member
 * @access  Private/Admin
 */
router.put('/:id', authorize('admin'), teamController.updateTeamMember);

/**
 * @route   DELETE /api/team/:id
 * @desc    Remove a team member (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id', authorize('admin'), teamController.removeTeamMember);

module.exports = router;
