const { sequelize } = require('../config/database');
const { logActivity } = require('../utils/activity.utils');

// @desc    Get all stages for a project
// @route   GET /api/projects/:projectId/stages
// @access  Private
exports.getProjectStages = async (req, res) => {
    try {
        const { projectId } = req.params;

        const [stages] = await sequelize.query(`
      SELECT 
        ps.*,
        u.name as "teamLeadName",
        u.email as "teamLeadEmail",
        COUNT(DISTINCT t.id) as "totalTasks",
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as "completedTasks"
      FROM project_stages ps
      LEFT JOIN users u ON ps."assignedTeamLead" = u.id
      LEFT JOIN tasks t ON t."stageId" = ps.id
      WHERE ps."projectId" = :projectId
      GROUP BY ps.id, u.name, u.email
      ORDER BY ps."stageNumber" ASC
    `, {
            replacements: { projectId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: stages.length,
            data: stages
        });
    } catch (error) {
        console.error('Error getting project stages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project stages',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get single stage details
// @route   GET /api/projects/:projectId/stages/:stageId
// @access  Private
exports.getStageDetails = async (req, res) => {
    try {
        const { projectId, stageId } = req.params;

        const [stages] = await sequelize.query(`
      SELECT 
        ps.*,
        p.name as "projectName",
        u.name as "teamLeadName",
        u.email as "teamLeadEmail",
        u.avatar as "teamLeadAvatar"
      FROM project_stages ps
      LEFT JOIN projects p ON ps."projectId" = p.id
      LEFT JOIN users u ON ps."assignedTeamLead" = u.id
      WHERE ps.id = :stageId AND ps."projectId" = :projectId
    `, {
            replacements: { projectId, stageId },
            type: sequelize.QueryTypes.SELECT
        });

        if (stages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Stage not found'
            });
        }

        // Get tasks for this stage
        const [tasks] = await sequelize.query(`
      SELECT 
        t.*,
        u.name as "assignedToName",
        u.email as "assignedToEmail"
      FROM tasks t
      LEFT JOIN users u ON t."assignedTo" = u.id
      WHERE t."stageId" = :stageId
      ORDER BY t."createdAt" DESC
    `, {
            replacements: { stageId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: {
                ...stages[0],
                tasks
            }
        });
    } catch (error) {
        console.error('Error getting stage details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stage details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update stage
// @route   PUT /api/projects/:projectId/stages/:stageId
// @access  Private (Admin, Project Manager)
exports.updateStage = async (req, res) => {
    try {
        const { projectId, stageId } = req.params;
        const {
            status,
            progressPercentage,
            assignedTeamLead,
            startDate,
            endDate,
            actualStartDate,
            actualEndDate,
            notes
        } = req.body;

        // Check if stage exists
        const [existingStage] = await sequelize.query(`
      SELECT * FROM project_stages WHERE id = :stageId AND "projectId" = :projectId
    `, {
            replacements: { stageId, projectId },
            type: sequelize.QueryTypes.SELECT
        });

        if (existingStage.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Stage not found'
            });
        }

        // Build update query dynamically
        const updates = [];
        const replacements = { stageId, projectId };

        if (status !== undefined) {
            updates.push('status = :status');
            replacements.status = status;
        }
        if (progressPercentage !== undefined) {
            updates.push('"progressPercentage" = :progressPercentage');
            replacements.progressPercentage = progressPercentage;
        }
        if (assignedTeamLead !== undefined) {
            updates.push('"assignedTeamLead" = :assignedTeamLead');
            replacements.assignedTeamLead = assignedTeamLead;
        }
        if (startDate !== undefined) {
            updates.push('"startDate" = :startDate');
            replacements.startDate = startDate;
        }
        if (endDate !== undefined) {
            updates.push('"endDate" = :endDate');
            replacements.endDate = endDate;
        }
        if (actualStartDate !== undefined) {
            updates.push('"actualStartDate" = :actualStartDate');
            replacements.actualStartDate = actualStartDate;
        }
        if (actualEndDate !== undefined) {
            updates.push('"actualEndDate" = :actualEndDate');
            replacements.actualEndDate = actualEndDate;
        }
        if (notes !== undefined) {
            updates.push('notes = :notes');
            replacements.notes = notes;
        }

        updates.push('"updatedAt" = CURRENT_TIMESTAMP');

        if (updates.length > 0) {
            await sequelize.query(`
        UPDATE project_stages 
        SET ${updates.join(', ')}
        WHERE id = :stageId AND "projectId" = :projectId
      `, {
                replacements,
                type: sequelize.QueryTypes.UPDATE
            });
        }

        // Get updated stage
        const [updatedStage] = await sequelize.query(`
      SELECT * FROM project_stages WHERE id = :stageId
    `, {
            replacements: { stageId },
            type: sequelize.QueryTypes.SELECT
        });

        // Log activity
        await logActivity({
            userId: req.user.id,
            projectId: parseInt(projectId),
            type: 'stage_updated',
            description: `Stage "${updatedStage[0].stageName}" was updated`
        });

        res.status(200).json({
            success: true,
            data: updatedStage[0]
        });
    } catch (error) {
        console.error('Error updating stage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stage',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get stage progress summary
// @route   GET /api/projects/:projectId/stages/summary
// @access  Private
exports.getStagesSummary = async (req, res) => {
    try {
        const { projectId } = req.params;

        const [summary] = await sequelize.query(`
      SELECT 
        ps."stageNumber",
        ps."stageName",
        ps.status,
        ps."progressPercentage",
        ps."startDate",
        ps."endDate",
        ps."actualStartDate",
        ps."actualEndDate",
        COUNT(DISTINCT t.id) as "totalTasks",
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as "completedTasks",
        COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as "inProgressTasks",
        COUNT(DISTINCT CASE WHEN t.status = 'blocked' THEN t.id END) as "blockedTasks"
      FROM project_stages ps
      LEFT JOIN tasks t ON t."stageId" = ps.id
      WHERE ps."projectId" = :projectId
      GROUP BY ps.id
      ORDER BY ps."stageNumber" ASC
    `, {
            replacements: { projectId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error getting stages summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stages summary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update stage progress based on tasks
// @route   POST /api/projects/:projectId/stages/:stageId/calculate-progress
// @access  Private
exports.calculateStageProgress = async (req, res) => {
    try {
        const { projectId, stageId } = req.params;

        // Calculate progress based on tasks
        const [result] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM tasks
      WHERE "stageId" = :stageId
    `, {
            replacements: { stageId },
            type: sequelize.QueryTypes.SELECT
        });

        const total = parseInt(result[0].total);
        const completed = parseInt(result[0].completed);
        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update stage progress
        await sequelize.query(`
      UPDATE project_stages 
      SET "progressPercentage" = :progressPercentage,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = :stageId AND "projectId" = :projectId
    `, {
            replacements: { stageId, projectId, progressPercentage },
            type: sequelize.QueryTypes.UPDATE
        });

        res.status(200).json({
            success: true,
            data: {
                stageId,
                totalTasks: total,
                completedTasks: completed,
                progressPercentage
            }
        });
    } catch (error) {
        console.error('Error calculating stage progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate stage progress',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
