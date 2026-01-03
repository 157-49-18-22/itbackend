const { sequelize } = require('../config/database');
const { logActivity } = require('../utils/activity.utils');

const stageNameMapping = {
    'ui_ux': 'UI/UX Design',
    'development': 'Development',
    'testing': 'Testing',
    'completed': 'Completed'
};

const reverseStageNameMapping = {
    'UI/UX Design': 'ui_ux',
    'Development': 'development',
    'Testing': 'testing',
    'Completed': 'completed'
};

// @desc    Get all stage transitions for a project
// @route   GET /api/projects/:projectId/stage-transitions
// @access  Private
exports.getProjectTransitions = async (req, res) => {
    try {
        const { projectId } = req.params;

        const [transitions] = await sequelize.query(`
      SELECT 
        st.*,
        u.name as "transitionedByName",
        u.email as "transitionedByEmail",
        fs."stageName" as "fromStageName",
        ts."stageName" as "toStageName"
      FROM stage_transitions st
      LEFT JOIN users u ON st."transitionedBy" = u.id
      LEFT JOIN project_stages fs ON st."fromStageId" = fs.id
      LEFT JOIN project_stages ts ON st."toStageId" = ts.id
      WHERE st."projectId" = :projectId
      ORDER BY st."transitionedAt" DESC
    `, {
            replacements: { projectId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: transitions.length,
            data: transitions
        });
    } catch (error) {
        console.error('Error getting stage transitions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stage transitions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Transition project to next stage
// @route   POST /api/projects/:projectId/stage-transitions
// @access  Private (Admin, Project Manager)
exports.transitionStage = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { projectId } = req.params;
        const {
            toStage,
            reason,
            notes,
            checklistCompleted = false,
            approvalReceived = false,
            approvalId
        } = req.body;

        if (!toStage) {
            return res.status(400).json({
                success: false,
                message: 'Target stage is required'
            });
        }

        // Get current project stage
        const [project] = await sequelize.query(`
      SELECT "currentStage" FROM projects WHERE id = :projectId
    `, {
            replacements: { projectId },
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (project.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const currentStageCode = project[0].currentStage;
        const currentStageName = stageNameMapping[currentStageCode] || currentStageCode;

        // Get stage IDs
        const [fromStage] = await sequelize.query(`
      SELECT id FROM project_stages 
      WHERE "projectId" = :projectId AND "stageName" = :stageName
    `, {
            replacements: { projectId, stageName: currentStageName },
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        const [toStageData] = await sequelize.query(`
      SELECT id FROM project_stages 
      WHERE "projectId" = :projectId AND "stageName" = :stageName
    `, {
            replacements: { projectId, stageName: toStage },
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (toStageData.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Target stage not found'
            });
        }

        const toStageCode = reverseStageNameMapping[toStage] || toStage.toLowerCase();

        // Create transition record
        const [transitionResult] = await sequelize.query(`
      INSERT INTO stage_transitions (
        "projectId", "fromStage", "toStage", "fromStageId", "toStageId",
        "transitionedBy", reason, notes, "checklistCompleted", 
        "approvalReceived", "approvalId", "transitionedAt", "createdAt"
      ) VALUES (
        :projectId, :fromStage, :toStage, :fromStageId, :toStageId,
        :userId, :reason, :notes, :checklistCompleted,
        :approvalReceived, :approvalId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `, {
            replacements: {
                projectId,
                fromStage: currentStageName,
                toStage,
                fromStageId: fromStage.length > 0 ? fromStage[0].id : null,
                toStageId: toStageData[0].id,
                userId: req.user.id,
                reason,
                notes,
                checklistCompleted,
                approvalReceived,
                approvalId: approvalId || null
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        // Update project current stage, phase and status
        const isCompleted = toStageCode === 'completed';
        await sequelize.query(`
      UPDATE projects 
      SET "currentStage" = :toStageCode,
          "currentPhase" = :toStageName,
          "status" = :status,
          "progress" = :progress,
          ${isCompleted ? '"actualEndDate" = CURRENT_TIMESTAMP,' : ''}
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = :projectId
    `, {
            replacements: {
                projectId,
                toStageCode,
                toStageName: toStage,
                status: isCompleted ? 'Completed' : 'In Progress',
                progress: isCompleted ? 100 : 0
            },
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        // Update old stage status to completed
        if (fromStage.length > 0) {
            await sequelize.query(`
        UPDATE project_stages
        SET status = 'completed',
            "actualEndDate" = CURRENT_DATE,
            "progressPercentage" = 100,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = :stageId
      `, {
                replacements: { stageId: fromStage[0].id },
                type: sequelize.QueryTypes.UPDATE,
                transaction
            });
        }

        // Update new stage status to in_progress
        await sequelize.query(`
      UPDATE project_stages
      SET status = 'in_progress',
          "actualStartDate" = CURRENT_DATE,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = :stageId
    `, {
            replacements: { stageId: toStageData[0].id },
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        // Create notification for team members
        const [teamMembers] = await sequelize.query(`
      SELECT DISTINCT u.id
      FROM users u
      INNER JOIN tasks t ON t."assignedTo" = u.id
      WHERE t."projectId" = :projectId
    `, {
            replacements: { projectId },
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        // Send notifications
        for (const member of teamMembers) {
            await sequelize.query(`
        INSERT INTO notifications (
          "userId", title, message, type, "relatedId", "relatedType",
          link, priority, "actionRequired", "createdAt", "updatedAt"
        ) VALUES (
          :userId, :title, :message, 'stage_transition', :projectId, 'project',
          :link, 'high', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, {
                replacements: {
                    userId: member.id,
                    title: 'Project Stage Transition',
                    message: `Project has moved to ${toStage} stage`,
                    projectId,
                    link: `/projects/${projectId}`
                },
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        }

        // Log activity
        await logActivity({
            userId: req.user.id,
            projectId: parseInt(projectId),
            type: 'stage_transition',
            description: `Project transitioned from ${currentStageName} to ${toStage}`
        });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: `Successfully transitioned to ${toStage} stage`,
            data: {
                transitionId: transitionResult[0][0].id,
                fromStage: currentStageName,
                toStage,
                transitionedAt: new Date()
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error transitioning stage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to transition stage',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get transition history
// @route   GET /api/projects/:projectId/stage-transitions/history
// @access  Private
exports.getTransitionHistory = async (req, res) => {
    try {
        const { projectId } = req.params;

        const [history] = await sequelize.query(`
      SELECT 
        st.*,
        u.name as "transitionedByName",
        u.avatar as "transitionedByAvatar",
        a.title as "approvalTitle",
        a.status as "approvalStatus"
      FROM stage_transitions st
      LEFT JOIN users u ON st."transitionedBy" = u.id
      LEFT JOIN approvals a ON st."approvalId" = a.id
      WHERE st."projectId" = :projectId
      ORDER BY st."transitionedAt" DESC
    `, {
            replacements: { projectId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error getting transition history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transition history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Check if stage can be transitioned
// @route   GET /api/projects/:projectId/stage-transitions/can-transition
// @access  Private
exports.canTransitionStage = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { toStage } = req.query;

        // Get current stage
        const [project] = await sequelize.query(`
      SELECT "currentStage" FROM projects WHERE id = :projectId
    `, {
            replacements: { projectId },
            type: sequelize.QueryTypes.SELECT
        });

        if (project.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const currentStageCode = project[0].currentStage;
        const currentStageName = stageNameMapping[currentStageCode] || currentStageCode;

        // Get current stage details
        const [stageDetails] = await sequelize.query(`
      SELECT 
        ps.*,
        COUNT(DISTINCT t.id) as "totalTasks",
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as "completedTasks"
      FROM project_stages ps
      LEFT JOIN tasks t ON t."stageId" = ps.id
      WHERE ps."projectId" = :projectId AND ps."stageName" = :stageName
      GROUP BY ps.id
    `, {
            replacements: { projectId, stageName: currentStageName },
            type: sequelize.QueryTypes.SELECT
        });

        if (stageDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Current stage not found'
            });
        }

        const stage = stageDetails[0];
        const totalTasks = parseInt(stage.totalTasks);
        const completedTasks = parseInt(stage.completedTasks);
        const progressPercentage = parseInt(stage.progressPercentage);

        // Check transition criteria
        const canTransition = {
            allowed: true,
            reasons: [],
            warnings: []
        };

        // Check if all tasks are completed
        if (totalTasks > 0 && completedTasks < totalTasks) {
            canTransition.warnings.push(`${totalTasks - completedTasks} tasks are still pending`);
        }

        // Check progress percentage
        if (progressPercentage < 100) {
            canTransition.warnings.push(`Stage is only ${progressPercentage}% complete`);
        }

        // Check if stage is blocked
        if (stage.status === 'blocked') {
            canTransition.allowed = false;
            canTransition.reasons.push('Current stage is blocked');
        }

        res.status(200).json({
            success: true,
            data: {
                currentStage,
                toStage: toStage || 'Next Stage',
                canTransition: canTransition.allowed,
                reasons: canTransition.reasons,
                warnings: canTransition.warnings,
                stageProgress: {
                    totalTasks,
                    completedTasks,
                    progressPercentage
                }
            }
        });
    } catch (error) {
        console.error('Error checking transition eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check transition eligibility',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
