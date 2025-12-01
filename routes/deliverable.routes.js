const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { sequelize, Deliverable, Project, User } = require('../models/sql');
const { Op } = require('sequelize');

router.use(protect);

// Get all deliverables with optional filters
router.get('/', async (req, res) => {
  try {
    const { projectId, phase, status } = req.query;
    const where = { isArchived: false };
    
    if (projectId) where.projectId = projectId;
    if (phase) where.phase = phase;
    if (status) where.status = status;

    const deliverables = await Deliverable.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'uploadedBy',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: deliverables });
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new deliverable
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { projectId } = req.body;
    
    // Check if project exists
    const project = await Project.findByPk(projectId, { transaction });
    if (!project) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    // Create the deliverable
    const deliverable = await Deliverable.create({ 
      ...req.body,
      uploadedById: req.user.id 
    }, { transaction });
    
    // Fetch the created deliverable with associations
    const createdDeliverable = await Deliverable.findByPk(deliverable.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'uploadedBy', attributes: ['id', 'name', 'email', 'avatar'] }
      ],
      transaction
    });
    
    // Commit the transaction
    await transaction.commit();
    
    res.status(201).json({ success: true, data: createdDeliverable });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error creating deliverable:', error);
    
    // Handle foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID. Please provide a valid project ID.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create deliverable. Please try again.' 
    });
  }
});

// Update a deliverable
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Deliverable.update(req.body, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Deliverable not found' });
    }

    // Fetch the updated deliverable with associations
    const updatedDeliverable = await Deliverable.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'uploadedBy', attributes: ['id', 'name', 'email', 'avatar'] }
      ]
    });

    res.json({ success: true, data: updatedDeliverable });
  } catch (error) {
    console.error('Error updating deliverable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a single deliverable by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deliverable = await Deliverable.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'uploadedBy', attributes: ['id', 'name', 'email', 'avatar'] }
      ]
    });

    if (!deliverable) {
      return res.status(404).json({ success: false, message: 'Deliverable not found' });
    }

    res.json({ success: true, data: deliverable });
  } catch (error) {
    console.error('Error fetching deliverable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a deliverable
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Deliverable.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Deliverable not found' });
    }

    res.json({ success: true, message: 'Deliverable deleted successfully' });
  } catch (error) {
    console.error('Error deleting deliverable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
