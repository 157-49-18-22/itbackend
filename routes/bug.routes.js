const express = require('express');
const router = express.Router();
const bugController = require('../controllers/bug.controller');
const { protect } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(protect);

// Create a new bug
router.post('/', bugController.createBug);

// Get all bugs with filters
router.get('/', bugController.getBugs);

// Get bug statistics
router.get('/stats', bugController.getBugStats);

// Get a single bug by ID
router.get('/:id', bugController.getBugById);

// Update a bug
router.put('/:id', bugController.updateBug);

// Update bug status
router.patch('/:id/status', bugController.updateStatus);

// Delete a bug
router.delete('/:id', bugController.deleteBug);

// Add a comment to a bug
router.post('/:id/comments', bugController.addComment);

module.exports = router;
