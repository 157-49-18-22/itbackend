const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Activity = require('../models/sql');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { project, type, user } = req.query;
    let query = {};
    if (project) query.project = project;
    if (type) query.type = type;
    if (user) query.user = user;

    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
