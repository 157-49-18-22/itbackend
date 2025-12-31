const { TestCase, User, Project } = require('../models/sql');
const { ErrorResponse } = require('../utils/errorResponse');
const { Op } = require('sequelize');

// The TestCase model is already initialized with the sequelize instance in the model file
const TestCaseModel = TestCase;

// @desc    Create a new test case
// @route   POST /api/test-cases
// @access  Private
exports.createTestCase = async (req, res, next) => {
  try {
    // Format the steps array if it's a string or not in the correct format
    let { steps, ...rest } = req.body;

    // Convert steps to proper format if it's a string
    let formattedSteps = [];
    if (typeof steps === 'string') {
      // If it's a string, split by newline and create step objects
      formattedSteps = steps
        .split('\n')
        .filter(step => step.trim() !== '')
        .map((step, index) => ({
          step: `Step ${index + 1}`,
          expected: step.trim()
        }));
    } else if (Array.isArray(steps)) {
      // If it's already an array, ensure each item has the correct structure
      formattedSteps = steps.map((item, index) => {
        if (typeof item === 'string') {
          return {
            step: `Step ${index + 1}`,
            expected: item.trim()
          };
        }
        // If it's already an object, ensure it has required fields
        return {
          step: item.step || `Step ${index + 1}`,
          expected: item.expected || ''
        };
      });
    }

    // Create the test case with formatted data
    const testCaseData = {
      ...rest,
      steps: formattedSteps,
      createdBy: req.user.id, // Use the numeric user ID from the authenticated user
      status: rest.status || 'not_run' // Ensure status has a default value
    };

    // Create the test case in the database
    const testCase = await TestCaseModel.create(testCaseData);

    // Include user details in the response
    const response = {
      ...testCase.get({ plain: true }),
      createdBy: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    };

    // If assignedTo is present, include assigned user details
    if (testCase.assignedTo) {
      const assignedUser = await User.findByPk(testCase.assignedTo);
      if (assignedUser) {
        response.assignedTo = {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email
        };
      }
    }

    res.status(201).json({
      success: true,
      data: testCase
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
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Set up where clause
    const where = JSON.parse(queryStr);

    // Set up includes for associations
    const include = [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
        required: false
      },
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email'],
        required: false
      },
      {
        model: Project,
        as: 'project',
        attributes: ['id', 'name'],
        required: false
      }
    ];

    // Set up query options
    const queryOptions = {
      where,
      include,
      order: [['createdAt', 'DESC']]
    };

    // Select Fields


    // Sort
    let order = [['createdAt', 'DESC']];
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').map(field => {
        if (field.startsWith('-')) {
          return [field.substring(1), 'DESC'];
        }
        return [field, 'ASC'];
      });
      order = sortBy;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Count total documents
    const total = await TestCaseModel.count({ where });

    // Execute query with pagination

    // Execute query with pagination
    const { count, rows: testCases } = await TestCaseModel.findAndCountAll({
      where,
      include,
      order: order,
      limit: limit,
      offset: (page - 1) * limit
    });

    // Calculate pagination
    const totalPages = Math.ceil(count / limit);
    const pagination = {
      total: count,
      pages: totalPages,
      page: page,
      limit: limit
    };

    if (page < totalPages) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (page > 1) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Format the response
    const formattedTestCases = testCases.map(tc => ({
      id: tc.id,
      title: tc.title,
      description: tc.description,
      type: tc.type,
      priority: tc.priority,
      status: tc.status,
      steps: tc.steps || [],
      expectedResult: tc.expectedResult || '',
      projectId: tc.projectId,
      createdBy: tc.createdBy,
      assignedTo: tc.assignedTo,
      createdAt: tc.createdAt,
      updatedAt: tc.updatedAt,
      creator: tc.creator,
      assignee: tc.assignee,
      project: tc.project
    }));

    res.status(200).json({
      success: true,
      count: formattedTestCases.length,
      total: count,
      pagination,
      data: formattedTestCases
    });
  } catch (error) {
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
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
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
    next(error);
  }
};

// @desc    Update test case
// @route   PUT /api/test-cases/:id
// @access  Private
exports.updateTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByPk(req.params.id);

    if (!testCase) {
      return next(
        new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404)
      );
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
      }
    }

    // Update the test case
    const updatedTestCase = await testCase.update(req.body);

    // Include user details in the response
    const response = {
      ...updatedTestCase.get({ plain: true }),
      createdBy: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    };

    // If assignedTo is present, include assigned user details
    if (updatedTestCase.assignedTo) {
      const assignedUser = await User.findByPk(updatedTestCase.assignedTo);
      if (assignedUser) {
        response.assignedTo = {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email
        };
      }
    }

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
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
      return next(
        new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404)
      );
    }

    await testCase.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add test result
// @route   POST /api/test-cases/:id/results
// @access  Private
exports.addTestResult = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByPk(req.params.id);

    if (!testCase) {
      return next(
        new ErrorResponse(`Test case not found with id of ${req.params.id}`, 404)
      );
    }

    // Create test result
    const TestResult = require('../models/sql/TestResult.model');
    const testResult = await TestResult.create({
      ...req.body,
      testCaseId: req.params.id,
      executedBy: req.user.id,
      executionDate: new Date()
    });

    // Update test case status
    await testCase.update({
      status: req.body.status,
      lastRun: new Date()
    });

    // Include user details in the response
    const response = {
      ...testResult.get({ plain: true }),
      executedBy: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    };

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error adding test result:', error);
    next(error);
  }
};
