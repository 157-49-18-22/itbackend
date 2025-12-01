const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getTeamPerformance, getFinancial } = require('../controllers/report.controller');
const { Project, Task, User } = require('../models/sql');

// Protect all routes with authentication
router.use(protect);

// Get team performance data
router.get('/team-performance', getTeamPerformance);

// Financial reports
router.get('/financial', getFinancial);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      teamMembers
    ] = await Promise.all([
      Project.count(),
      Project.count({ where: { status: 'In Progress' } }),
      Task.count(),
      Task.count({ where: { status: 'completed' } }),
      User.count({ where: { status: 'active' } })
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        teamMembers
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
