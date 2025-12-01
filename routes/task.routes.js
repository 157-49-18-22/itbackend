const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { Task, User, Project } = require('../models/sql');

router.use(protect);

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { project, status, assignee, type } = req.query;
    const where = {};
    
    if (project) where.projectId = project;
    if (status) where.status = status;
    if (assignee) where.assigneeId = assignee;
    if (type && type !== 'all') where.type = type;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const taskData = { 
      ...req.body,
      reporterId: req.user.id,
      status: req.body.status || 'to_do' // Default status
    };
    
    // Only include projectId if it's provided
    if (req.body.projectId) {
      taskData.projectId = req.body.projectId;
    }
    
    const task = await Task.create(taskData);
    
    // Fetch the created task with related data
    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.status(201).json({ success: true, data: createdTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    await task.update(req.body);
    
    // Fetch the updated task with related data
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    await task.destroy();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
