const express = require('express');
const router = express.Router();
const {
  createTestCase,
  getTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
  addTestResult
} = require('../controllers/testCase.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Include other resource routers
const testResultRouter = require('./testResult.routes');

// Re-route into other resource routers
router.use('/:testCaseId/results', testResultRouter);

// Apply protect middleware to all routes
router.use(protect);

// Routes for /api/test-cases
router
  .route('/')
  .get(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), getTestCases)
  .post(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), createTestCase);

// Routes for /api/test-cases/:id
router
  .route('/:id')
  .get(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), getTestCase)
  .put(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), updateTestCase)
  .delete(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), deleteTestCase);

// Route for /api/test-cases/:id/results
router
  .route('/:id/results')
  .post(authorize('Tester', 'Developer', 'Project Manager', 'Admin', 'user', 'admin'), addTestResult);

module.exports = router;
