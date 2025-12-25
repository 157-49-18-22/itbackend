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
  .get(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), getTestResults)
  .post(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), createTestResult);

// Routes for /api/test-results/:id
router
  .route('/:id')
  .get(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), getTestResult)
  .put(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), updateTestResult)
  .delete(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), deleteTestResult);

module.exports = router;
