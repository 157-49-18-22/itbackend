const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Sprint = require('../models/sql/Sprint.model');
const { Project } = require('../models/sql');

router.use(protect);

// Get all sprints
router.get('/', async (req, res) => {
  try {
    const { projectId, status } = req.query;
    let where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const sprints = await Sprint.findAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
      order: [['startDate', 'DESC']]
    });

    res.json({ success: true, data: sprints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sprint by ID
router.get('/:id', async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project' }]
    });

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    res.json({ success: true, data: sprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create sprint
router.post('/', authorize('Admin', 'Project Manager', 'Developer'), async (req, res) => {
  try {
    console.log('Creating sprint with data:', req.body);
    const sprint = await Sprint.create(req.body);
    res.status(201).json({ success: true, data: sprint });
  } catch (error) {
    console.error('Error creating sprint:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      errors: error.errors,
      sql: error.sql
    });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update sprint
router.put('/:id', authorize('Admin', 'Project Manager', 'Developer'), async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    await sprint.update(req.body);
    res.json({ success: true, data: sprint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start sprint
router.put('/:id/start', authorize('Admin', 'Project Manager', 'Developer'), async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    await sprint.update({ status: 'Active', startDate: new Date() });
    res.json({ success: true, data: sprint, message: 'Sprint started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete sprint
router.put('/:id/complete', authorize('Admin', 'Project Manager', 'Developer'), async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    const { retrospective } = req.body;
    await sprint.update({
      status: 'Completed',
      endDate: new Date(),
      retrospective
    });

    res.json({ success: true, data: sprint, message: 'Sprint completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete sprint
router.delete('/:id', authorize('Admin'), async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found' });
    }

    await sprint.destroy();
    res.json({ success: true, message: 'Sprint deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
