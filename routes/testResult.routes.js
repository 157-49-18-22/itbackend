const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTestResult,
  getTestResults,
  getTestResult,
  updateTestResult,
  deleteTestResult
} = require('../controllers/testResult.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected and require authentication
router.use(protect);

// Routes for /api/test-cases/:testCaseId/results
router
  .route('/')
  .get(authorize('user', 'admin'), getTestResults)
  .post(authorize('user', 'admin'), createTestResult);

// Routes for /api/test-results/:id
router
  .route('/:id')
  .get(authorize('user', 'admin'), getTestResult)
  .put(authorize('user', 'admin'), updateTestResult)
  .delete(authorize('user', 'admin'), deleteTestResult);

module.exports = router;
