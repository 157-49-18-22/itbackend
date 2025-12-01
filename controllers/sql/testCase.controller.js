const { TestCase } = require('../../models/sql/TestCase.model');
const { ErrorResponse } = require('../../utils/errorResponse');

// @desc    Create a new test case
// @route   POST /api/test-cases
// @access  Private
exports.createTestCase = async (req, res, next) => {
  try {
    const { title, description, type, priority, expectedResult, steps, projectId } = req.body;
    
    // Format steps if needed
    let formattedSteps = [];
    if (steps) {
      if (typeof steps === 'string') {
        formattedSteps = steps
          .split('\n')
          .filter(step => step.trim() !== '')
          .map((step, index) => ({
            step: `Step ${index + 1}`,
            expected: step.trim()
          }));
      } else if (Array.isArray(steps)) {
        formattedSteps = steps.map((item, index) => {
          if (typeof item === 'string') {
            return {
              step: `Step ${index + 1}`,
              expected: item.trim()
            };
          }
          return {
            step: item.step || `Step ${index + 1}`,
            expected: item.expected || ''
          };
        });
      }
    }

    // Create the test case
    const testCase = await TestCase.create({
      title: title || 'Untitled Test Case',
      description: description || '',
      type: type || 'functional',
      priority: priority || 'medium',
      expectedResult: expectedResult || '',
      steps: formattedSteps,
      status: 'not_run',
      projectId: projectId || null,
      createdBy: req.user.id // Using the numeric user ID from auth middleware
    });

    // Fetch the created test case with user details
    const createdTestCase = await TestCase.findByPk(testCase.id, {
      include: [
        {
          association: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdTestCase
    });
  } catch (error) {
    console.error('Error creating test case:', error);
    next(error);
  }
};

// @desc    Get all test cases
// @route   GET /api/test-cases
// @access  Private
exports.getTestCases = async (req, res, next) => {
  try {
    const testCases = await TestCase.findAll({
      include: [
        {
          association: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          association: 'project',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: testCases.length,
      data: testCases
    });
  } catch (error) {
    console.error('Error fetching test cases:', error);
    next(error);
  }
};

// @desc    Get single test case
// @route   GET /api/test-cases/:id
// @access  Private
exports.getTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByPk(req.params.id, {
      include: [
        {
          association: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          association: 'project',
          attributes: ['id', 'name']
        },
        {
          association: 'testResults',
          include: [
            {
              association: 'testedBy',
              attributes: ['id', 'name', 'email']
            }
          ],
          order: [['testedAt', 'DESC']]
        }
      ]
    });

    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: testCase
    });
  } catch (error) {
    console.error('Error fetching test case:', error);
    next(error);
  }
};

// @desc    Update test case
// @route   PUT /api/test-cases/:id
// @access  Private
exports.updateTestCase = async (req, res, next) => {
  try {
    let testCase = await TestCase.findByPk(req.params.id);

    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    // Format steps if provided
    if (req.body.steps) {
      if (typeof req.body.steps === 'string') {
        req.body.steps = req.body.steps
          .split('\n')
          .filter(step => step.trim() !== '')
          .map((step, index) => ({
            step: `Step ${index + 1}`,
            expected: step.trim()
          }));
      } else if (Array.isArray(req.body.steps)) {
        req.body.steps = req.body.steps.map((item, index) => {
          if (typeof item === 'string') {
            return {
              step: `Step ${index + 1}`,
              expected: item.trim()
            };
          }
          return {
            step: item.step || `Step ${index + 1}`,
            expected: item.expected || ''
          };
        });
      }
    }

    // Update test case
    testCase = await testCase.update(req.body, {
      returning: true,
      plain: true
    });

    // Fetch the updated test case with user details
    const updatedTestCase = await TestCase.findByPk(testCase.id, {
      include: [
        {
          association: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedTestCase
    });
  } catch (error) {
    console.error('Error updating test case:', error);
    next(error);
  }
};

// @desc    Delete test case
// @route   DELETE /api/test-cases/:id
// @access  Private
exports.deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByPk(req.params.id);

    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    await testCase.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting test case:', error);
    next(error);
  }
};

// @desc    Add test result
// @route   POST /api/test-cases/:id/results
// @access  Private
exports.addTestResult = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const testCase = await TestCase.findByPk(req.params.id);

    if (!testCase) {
      return next(new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404));
    }

    // Create test result
    const testResult = await testCase.createTestResult({
      status,
      notes: notes || '',
      testedById: req.user.id,
      testedAt: new Date()
    });

    // Update test case status
    await testCase.update({
      status,
      lastRun: new Date()
    });

    // Fetch the created test result with user details
    const createdTestResult = await testResult.reload({
      include: [
        {
          association: 'testedBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdTestResult
    });
  } catch (error) {
    console.error('Error adding test result:', error);
    next(error);
  }
};
