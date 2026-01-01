const { sequelize } = require('../config/database');
const { UAT, User, Project } = require('../models/sql');
const { Op } = require('sequelize');

// Create a new UAT test case
exports.createUAT = async (req, res) => {
  try {
    const { title, description, steps, testSteps, status, priority, tester, testerName, projectId } = req.body;

    const uat = await UAT.create({
      title,
      description,
      steps: Array.isArray(steps || testSteps) ? (steps || testSteps).filter(step => step.trim() !== '') : [],
      status: status || 'pending',
      priority: priority || 'medium',
      tester: tester || testerName || null,
      projectId: projectId || null,
      createdBy: req.user.id
    });

    // Fetch the created UAT with creator details
    const createdUAT = await UAT.findByPk(uat.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdUAT
    });
  } catch (error) {
    console.error('Error creating UAT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create UAT test case',
      error: error.message
    });
  }
};

// Get all UAT test cases
exports.getAllUATs = async (req, res) => {
  try {
    const { search, status, projectId } = req.query;
    const where = {};

    // Add search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tester: { [Op.like]: `%${search}%` } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Add project filter
    if (projectId) {
      where.projectId = projectId;
    }

    const uats = await UAT.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: uats.length,
      data: uats
    });
  } catch (error) {
    console.error('Error fetching UATs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UAT test cases',
      error: error.message
    });
  }
};

// Get a single UAT test case by ID
exports.getUATById = async (req, res) => {
  try {
    const { id } = req.params;

    const uat = await UAT.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!uat) {
      return res.status(404).json({
        success: false,
        message: 'UAT test case not found'
      });
    }

    res.status(200).json({
      success: true,
      data: uat
    });
  } catch (error) {
    console.error('Error fetching UAT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UAT test case',
      error: error.message
    });
  }
};

// Update a UAT test case
exports.updateUAT = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, steps, testSteps, status, priority, tester, testerName, projectId } = req.body;

    const uat = await UAT.findByPk(id);

    if (!uat) {
      return res.status(404).json({
        success: false,
        message: 'UAT test case not found'
      });
    }

    // Update fields if they are provided in the request
    if (title) uat.title = title;
    if (description) uat.description = description;
    if (steps || testSteps) uat.steps = Array.isArray(steps || testSteps) ? (steps || testSteps).filter(step => step.trim() !== '') : [];
    if (status) uat.status = status;
    if (priority) uat.priority = priority;
    if (tester !== undefined || testerName !== undefined) uat.tester = tester || testerName;
    if (projectId !== undefined) uat.projectId = projectId;

    await uat.save();

    // Fetch the updated UAT with related data
    const updatedUAT = await UAT.findByPk(uat.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedUAT
    });
  } catch (error) {
    console.error('Error updating UAT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update UAT test case',
      error: error.message
    });
  }
};

// Delete a UAT test case
exports.deleteUAT = async (req, res) => {
  try {
    const { id } = req.params;

    const uat = await UAT.findByPk(id);

    if (!uat) {
      return res.status(404).json({
        success: false,
        message: 'UAT test case not found'
      });
    }

    await uat.destroy();

    res.status(200).json({
      success: true,
      message: 'UAT test case deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting UAT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete UAT test case',
      error: error.message
    });
  }
};

// Update UAT status
exports.updateUATStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in-progress', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const uat = await UAT.findByPk(id);

    if (!uat) {
      return res.status(404).json({
        success: false,
        message: 'UAT test case not found'
      });
    }

    uat.status = status;
    await uat.save();

    res.status(200).json({
      success: true,
      data: uat
    });
  } catch (error) {
    console.error('Error updating UAT status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update UAT status',
      error: error.message
    });
  }
};
