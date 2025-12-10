const express = require('express');
const router = express.Router();
const {
    getDashboardMetrics,
    getStageSummary,
    getPendingApprovals,
    getTeamWorkload,
    getBugStatistics,
    getMyDashboard
} = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/dashboard/metrics - Get enhanced dashboard metrics
router.get('/metrics', getDashboardMetrics);

// GET /api/dashboard/my-dashboard - Get user-specific dashboard
router.get('/my-dashboard', getMyDashboard);

// GET /api/dashboard/stage-summary - Get stage-wise project summary
router.get('/stage-summary', getStageSummary);

// GET /api/dashboard/pending-approvals - Get pending approvals summary
router.get('/pending-approvals', getPendingApprovals);

// GET /api/dashboard/team-workload - Get team workload distribution
router.get('/team-workload', authorize('Admin', 'Project Manager'), getTeamWorkload);

// GET /api/dashboard/bug-stats - Get bug statistics
router.get('/bug-stats', getBugStatistics);

module.exports = router;
