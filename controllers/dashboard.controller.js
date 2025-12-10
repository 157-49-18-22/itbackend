const { sequelize } = require('../config/database');

// @desc    Get enhanced dashboard metrics
// @route   GET /api/dashboard/metrics
// @access  Private
exports.getDashboardMetrics = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get project counts by stage
        const [stageCounts] = await sequelize.query(`
      SELECT 
        "currentStage",
        COUNT(*) as count
      FROM projects
      WHERE status != 'cancelled' AND "isArchived" = false
      GROUP BY "currentStage"
    `, {
            type: sequelize.QueryTypes.SELECT
        });

        // Get pending approvals count
        const [approvalCounts] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM approvals
      WHERE status = 'pending'
      ${userRole !== 'admin' ? 'AND "requestedTo" = :userId' : ''}
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        // Get overdue tasks count
        const [overdueTasks] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE "dueDate" < CURRENT_DATE
      AND status NOT IN ('completed', 'cancelled')
      ${userRole !== 'admin' ? 'AND "assignedTo" = :userId' : ''}
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        // Get team workload
        const [teamWorkload] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.role,
        u.avatar,
        COUNT(DISTINCT t.id) as "activeTasks",
        COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as "inProgressTasks",
        COUNT(DISTINCT t."projectId") as "projectsInvolved"
      FROM users u
      LEFT JOIN tasks t ON u.id = t."assignedTo" AND t.status IN ('todo', 'in_progress')
      WHERE u.role IN ('developer', 'designer', 'tester')
      AND u.status = 'active'
      GROUP BY u.id
      ORDER BY "activeTasks" DESC
      LIMIT 10
    `, {
            type: sequelize.QueryTypes.SELECT
        });

        // Get recent activities
        const [recentActivities] = await sequelize.query(`
      SELECT 
        at.*,
        u.name as "userName",
        u.avatar as "userAvatar"
      FROM audit_trail at
      LEFT JOIN users u ON at."userId" = u.id
      ORDER BY at.timestamp DESC
      LIMIT 10
    `, {
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: {
                projectsByStage: {
                    uiux: stageCounts.find(s => s.currentStage === 'ui_ux')?.count || 0,
                    development: stageCounts.find(s => s.currentStage === 'development')?.count || 0,
                    testing: stageCounts.find(s => s.currentStage === 'testing')?.count || 0,
                    completed: stageCounts.find(s => s.currentStage === 'completed')?.count || 0
                },
                pendingApprovals: parseInt(approvalCounts[0].count),
                overdueTasks: parseInt(overdueTasks[0].count),
                teamWorkload,
                recentActivities
            }
        });
    } catch (error) {
        console.error('Error getting dashboard metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard metrics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get stage-wise project summary
// @route   GET /api/dashboard/stage-summary
// @access  Private
exports.getStageSummary = async (req, res) => {
    try {
        const [summary] = await sequelize.query(`
      SELECT * FROM project_dashboard_summary
      WHERE status != 'cancelled'
      ORDER BY "createdAt" DESC
    `, {
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: summary.length,
            data: summary
        });
    } catch (error) {
        console.error('Error getting stage summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stage summary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get pending approvals summary
// @route   GET /api/dashboard/pending-approvals
// @access  Private
exports.getPendingApprovals = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const [approvals] = await sequelize.query(`
      SELECT * FROM pending_approvals_summary
      ${userRole !== 'admin' ? 'WHERE requested_to_name = (SELECT name FROM users WHERE id = :userId)' : ''}
      ORDER BY urgency_status DESC, "requestedAt" ASC
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: approvals.length,
            data: approvals
        });
    } catch (error) {
        console.error('Error getting pending approvals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending approvals',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get team workload distribution
// @route   GET /api/dashboard/team-workload
// @access  Private (Admin, Project Manager)
exports.getTeamWorkload = async (req, res) => {
    try {
        const [workload] = await sequelize.query(`
      SELECT * FROM user_workload_summary
      ORDER BY active_tasks DESC
    `, {
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: workload.length,
            data: workload
        });
    } catch (error) {
        console.error('Error getting team workload:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team workload',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get bug statistics
// @route   GET /api/dashboard/bug-stats
// @access  Private
exports.getBugStatistics = async (req, res) => {
    try {
        const { projectId } = req.query;

        let query = 'SELECT * FROM bug_statistics';
        const replacements = {};

        if (projectId) {
            query += ' WHERE project_id = :projectId';
            replacements.projectId = projectId;
        }

        const [stats] = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: stats.length,
            data: stats
        });
    } catch (error) {
        console.error('Error getting bug statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bug statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get user-specific dashboard
// @route   GET /api/dashboard/my-dashboard
// @access  Private
exports.getMyDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // My tasks
        const [myTasks] = await sequelize.query(`
      SELECT 
        t.*,
        p.name as "projectName",
        ps."stageName"
      FROM tasks t
      LEFT JOIN projects p ON t."projectId" = p.id
      LEFT JOIN project_stages ps ON t."stageId" = ps.id
      WHERE t."assignedTo" = :userId
      AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t."dueDate" ASC NULLS LAST
      LIMIT 10
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        // My projects
        const [myProjects] = await sequelize.query(`
      SELECT DISTINCT
        p.*,
        ps."stageName" as "currentStageName",
        ps.status as "currentStageStatus",
        ps."progressPercentage" as "currentStageProgress"
      FROM projects p
      INNER JOIN tasks t ON p.id = t."projectId"
      LEFT JOIN project_stages ps ON p.id = ps."projectId" AND p."currentStage" = ps."stageName"
      WHERE t."assignedTo" = :userId
      AND p.status != 'cancelled'
      ORDER BY p."updatedAt" DESC
      LIMIT 5
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        // My notifications
        const [myNotifications] = await sequelize.query(`
      SELECT * FROM notifications
      WHERE "userId" = :userId
      AND "isRead" = false
      ORDER BY "createdAt" DESC
      LIMIT 10
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: {
                tasks: myTasks,
                projects: myProjects,
                notifications: myNotifications,
                summary: {
                    totalTasks: myTasks.length,
                    totalProjects: myProjects.length,
                    unreadNotifications: myNotifications.length
                }
            }
        });
    } catch (error) {
        console.error('Error getting my dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
