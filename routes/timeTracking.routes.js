const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { TimeTracking } = require('../models/sql');
const { Op } = require('sequelize');

router.use(protect);

// Get all time entries with filters
router.get('/', async (req, res) => {
  try {
    const { projectId, userId, startDate, endDate } = req.query;
    const where = {};
    
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const include = [
      { association: 'user', attributes: ['id', 'name', 'email'] },
      { association: 'project', attributes: ['id', 'name'] }
    ];
    
    // Only include task association if there are entries with taskId
    const hasTasks = await TimeTracking.findOne({ 
      where: { ...where, taskId: { [Op.not]: null } },
      limit: 1
    });
    
    if (hasTasks) {
      include.push({ association: 'task', attributes: ['id', 'title'], required: false });
    }
    
    const entries = await TimeTracking.findAll({
      where,
      include,
      order: [['startTime', 'DESC']]
    });

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch time entries' });
  }
});

// Create a new time entry
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated user ID:', req.user?.id);
    
    const { startTime, endTime, projectId, taskId, description, isBillable } = req.body;
    
    // Validate required fields
    if (!projectId) {
      console.error('Validation failed: Project ID is required');
      return res.status(400).json({
        success: false,
        message: 'Project ID is required for time tracking',
        field: 'projectId'
      });
    }

    if (!req.user?.id) {
      console.error('Authentication error: No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Parse dates and validate
    const startDate = startTime ? new Date(startTime) : new Date();
    const endDate = endTime ? new Date(endTime) : null;

    if (isNaN(startDate.getTime())) {
      console.error('Invalid startTime format:', startTime);
      return res.status(400).json({
        success: false,
        message: 'Invalid start time format',
        field: 'startTime',
        value: startTime
      });
    }

    if (endDate && isNaN(endDate.getTime())) {
      console.error('Invalid endTime format:', endTime);
      return res.status(400).json({
        success: false,
        message: 'Invalid end time format',
        field: 'endTime',
        value: endTime
      });
    }

    if (endDate && endDate <= startDate) {
      console.error('End time must be after start time');
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    const timeEntryData = {
      userId: req.user.id,
      projectId,
      taskId: taskId || null,
      description: description || null,
      startTime: startDate,
      endTime: endDate,
      duration: endDate ? Math.ceil((endDate - startDate) / 60000) : 0,
      isBillable: isBillable !== undefined ? Boolean(isBillable) : true
    };

    console.log('Creating time entry with data:', JSON.stringify(timeEntryData, null, 2));
    
    const entry = await TimeTracking.create(timeEntryData);
    console.log('Time entry created with ID:', entry.id);

    // Fetch the created entry with associations
    const include = [
      { association: 'user', attributes: ['id', 'name', 'email'] },
      { association: 'project', attributes: ['id', 'name'] }
    ];
    
    // Only include task association if taskId is not null
    if (taskId) {
      include.push({ association: 'task', attributes: ['id', 'title'] });
    }
    
    const createdEntry = await TimeTracking.findByPk(entry.id, { include });

    return res.status(201).json({ success: true, data: createdEntry });
  } catch (error) {
    console.error('Error creating time entry:', error);
    
    // Log the complete error object for debugging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      sql: error.sql,
      stack: error.stack
    });
    
    // Handle specific error types
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const constraint = error.parent?.constraint || 'unknown_constraint';
      console.error('Foreign key constraint violation:', constraint);
      
      let message = 'Database constraint violation';
      if (constraint.includes('userId')) message = 'Invalid user ID';
      else if (constraint.includes('projectId')) message = 'Invalid project ID';
      else if (constraint.includes('taskId')) message = 'Invalid task ID';
      
      return res.status(400).json({
        success: false,
        message,
        error: {
          name: error.name,
          constraint,
          ...(process.env.NODE_ENV === 'development' && {
            details: error.parent?.detail || error.message
          })
        }
      });
    }
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors?.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      })) || [];
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    // Generic error response
    const errorResponse = {
      success: false,
      message: 'Failed to create time entry',
      error: {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.errors || error.sqlMessage || error.original?.message,
          stack: error.stack
        })
      }
    };
    
    return res.status(500).json(errorResponse);
  }
});

// Stop a running time entry
router.put('/:id/stop', async (req, res) => {
  try {
    const entry = await TimeTracking.findByPk(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Time entry not found' });
    }

    // Only allow the owner to stop the time entry
    if (entry.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const now = new Date();
    const duration = Math.ceil((now - new Date(entry.startTime)) / 60000); // in minutes

    const [updated] = await TimeTracking.update(
      { 
        endTime: now,
        duration: entry.duration + duration,
        status: 'stopped' 
      },
      { 
        where: { id: req.params.id },
        returning: true
      }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Failed to update time entry' });
    }

    const updatedEntry = await TimeTracking.findByPk(req.params.id, {
      include: [
        { association: 'user', attributes: ['id', 'name', 'email'] },
        { association: 'project', attributes: ['id', 'name'] },
        { association: 'task', attributes: ['id', 'title'] }
      ]
    });

    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Error stopping time entry:', error);
    res.status(500).json({ 
      success: false, 
      message: error.errors ? error.errors[0].message : 'Failed to stop time entry' 
    });
  }
});

module.exports = router;
