const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getTaskChecklist,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    toggleChecklistItem,
    reorderChecklistItems
} = require('../controllers/taskChecklists.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/tasks/:taskId/checklist - Get all checklist items
router.get('/', getTaskChecklist);

// POST /api/tasks/:taskId/checklist - Create checklist item
router.post('/', createChecklistItem);

// PUT /api/tasks/:taskId/checklist/reorder - Reorder checklist items
router.put('/reorder', reorderChecklistItems);

// PATCH /api/tasks/:taskId/checklist/:itemId/toggle - Toggle completion
router.patch('/:itemId/toggle', toggleChecklistItem);

// PUT /api/tasks/:taskId/checklist/:itemId - Update checklist item
router.put('/:itemId', updateChecklistItem);

// DELETE /api/tasks/:taskId/checklist/:itemId - Delete checklist item
router.delete('/:itemId', deleteChecklistItem);

module.exports = router;
