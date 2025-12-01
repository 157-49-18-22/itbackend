const TestResult = require('../models/TestResult.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create test result
// @route   POST /api/test-cases/:testCaseId/results
// @access  Private
const createTestResult = async (req, res, next) => {
  try {
    // Add testCase to req.body
    req.body.testCase = req.params.testCaseId;
    req.body.executedBy = req.user.id;

    const testResult = await TestResult.create(req.body);

    res.status(201).json({
      success: true,
      data: testResult
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get test results for a test case
// @route   GET /api/test-cases/:testCaseId/results
// @access  Private
const getTestResults = async (req, res, next) => {
  try {
    const testResults = await TestResult.find({ testCase: req.params.testCaseId })
      .sort('-createdAt')
      .populate('executedBy', 'name email');

    res.status(200).json({
      success: true,
      count: testResults.length,
      data: testResults
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single test result
// @route   GET /api/test-results/:id
// @access  Private
const getTestResult = async (req, res, next) => {
  try {
    const testResult = await TestResult.findById(req.params.id)
      .populate('testCase', 'title')
      .populate('executedBy', 'name email');

    if (!testResult) {
      return next(
        new ErrorResponse(`Test result not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: testResult
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update test result
// @route   PUT /api/test-results/:id
// @access  Private
const updateTestResult = async (req, res, next) => {
  try {
    let testResult = await TestResult.findById(req.params.id);

    if (!testResult) {
      return next(
        new ErrorResponse(`Test result not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is test result owner or admin
    if (testResult.executedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this test result`, 401)
      );
    }

    testResult = await TestResult.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: testResult
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete test result
// @route   DELETE /api/test-results/:id
// @access  Private
const deleteTestResult = async (req, res, next) => {
  try {
    const testResult = await TestResult.findById(req.params.id);

    if (!testResult) {
      return next(
        new ErrorResponse(`Test result not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is test result owner or admin
    if (testResult.executedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to delete this test result`, 401)
      );
    }

    await testResult.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTestResult,
  getTestResults,
  getTestResult,
  updateTestResult,
  deleteTestResult
};
