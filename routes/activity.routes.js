const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { Activity } = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { projectId, userId, type } = req.query;
    const { Activity, User, Project, Task, Approval } = require('../models/sql');

    let where = {};
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (type) where.type = type;

    const activities = await Activity.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: Task, as: 'relatedTask', attributes: ['id', 'name'], required: false },
        { model: Approval, as: 'relatedApproval', attributes: ['id', 'title'], required: false }
      ],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
