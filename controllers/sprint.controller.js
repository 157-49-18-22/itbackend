const { Sprint, Project } = require('../models/sql');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Create a new sprint
exports.createSprint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, goal, startDate, endDate, velocity, projectId } = req.body;
    
    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const sprint = await Sprint.create({
      name,
      goal,
      startDate,
      endDate,
      velocity: velocity || 20,
      projectId,
      status: 'Planned',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.status(201).json(sprint);
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ message: 'Failed to create sprint', error: error.message });
  }
};

// Get all sprints
exports.getAllSprints = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};
    
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const sprints = await Sprint.findAll({
      where,
      include: [
        {
          model: Project,
          attributes: ['id', 'name']
        }
      ],
      order: [['startDate', 'DESC']]
    });

    res.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ message: 'Failed to fetch sprints', error: error.message });
  }
};

// Get sprint by ID
exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    res.json(sprint);
  } catch (error) {
    console.error('Error fetching sprint:', error);
    res.status(500).json({ message: 'Failed to fetch sprint', error: error.message });
  }
};

// Update sprint
exports.updateSprint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, goal, startDate, endDate, velocity, status } = req.body;

    const sprint = await Sprint.findByPk(id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    await sprint.update({
      name: name || sprint.name,
      goal: goal || sprint.goal,
      startDate: startDate || sprint.startDate,
      endDate: endDate || sprint.endDate,
      velocity: velocity || sprint.velocity,
      status: status || sprint.status,
      updatedBy: req.user.id
    });

    res.json(sprint);
  } catch (error) {
    console.error('Error updating sprint:', error);
    res.status(500).json({ message: 'Failed to update sprint', error: error.message });
  }
};

// Delete sprint
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    await sprint.destroy();
    res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    res.status(500).json({ message: 'Failed to delete sprint', error: error.message });
  }
};

// Get sprint statistics
exports.getSprintStats = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};
    
    if (projectId) where.projectId = projectId;

    const stats = await Sprint.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching sprint stats:', error);
    res.status(500).json({ message: 'Failed to fetch sprint stats', error: error.message });
  }
};
