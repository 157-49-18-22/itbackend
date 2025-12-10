const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getProjectTransitions,
    transitionStage,
    getTransitionHistory,
    canTransitionStage
} = require('../controllers/stageTransitions.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/projects/:projectId/stage-transitions - Get all transitions
router.get('/', getProjectTransitions);

// GET /api/projects/:projectId/stage-transitions/history - Get transition history
router.get('/history', getTransitionHistory);

// GET /api/projects/:projectId/stage-transitions/can-transition - Check if can transition
router.get('/can-transition', canTransitionStage);

// POST /api/projects/:projectId/stage-transitions - Create new transition
router.post('/', authorize('Admin', 'Project Manager'), transitionStage);

module.exports = router;
