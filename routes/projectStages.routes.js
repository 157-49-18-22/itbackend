const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :projectId
const {
    getProjectStages,
    getStageDetails,
    updateStage,
    getStagesSummary,
    calculateStageProgress
} = require('../controllers/projectStages.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/projects/:projectId/stages - Get all stages for a project
router.get('/', getProjectStages);

// GET /api/projects/:projectId/stages/summary - Get stages summary
router.get('/summary', getStagesSummary);

// GET /api/projects/:projectId/stages/:stageId - Get single stage details
router.get('/:stageId', getStageDetails);

// PUT /api/projects/:projectId/stages/:stageId - Update stage
router.put('/:stageId', authorize('Admin', 'Project Manager'), updateStage);

// POST /api/projects/:projectId/stages/:stageId/calculate-progress - Calculate stage progress
router.post('/:stageId/calculate-progress', calculateStageProgress);

module.exports = router;
