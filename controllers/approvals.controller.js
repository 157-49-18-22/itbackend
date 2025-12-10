const { sequelize } = require('../config/database');
const { logActivity } = require('../utils/activity.utils');

// @desc    Get all approvals
// @route   GET /api/approvals
// @access  Private
exports.getApprovals = async (req, res) => {
    try {
        const { status, approvalType, projectId } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let whereClause = [];
        const replacements = {};

        // Non-admin users only see approvals they requested or need to approve
        if (userRole !== 'admin') {
            whereClause.push('(a."requestedBy" = :userId OR a."requestedTo" = :userId)');
            replacements.userId = userId;
        }

        if (status) {
            whereClause.push('a.status = :status');
            replacements.status = status;
        }

        if (approvalType) {
            whereClause.push('a."approvalType" = :approvalType');
            replacements.approvalType = approvalType;
        }

        if (projectId) {
            whereClause.push('a."projectId" = :projectId');
            replacements.projectId = projectId;
        }

        const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

        const [approvals] = await sequelize.query(`
      SELECT 
        a.*,
        p.name as "projectName",
        requester.name as "requestedByName",
        requester.email as "requestedByEmail",
        requester.avatar as "requestedByAvatar",
        approver.name as "requestedToName",
        approver.email as "requestedToEmail",
        approver.avatar as "requestedToAvatar",
        responder.name as "respondedByName"
      FROM approvals a
      LEFT JOIN projects p ON a."projectId" = p.id
      LEFT JOIN users requester ON a."requestedBy" = requester.id
      LEFT JOIN users approver ON a."requestedTo" = approver.id
      LEFT JOIN users responder ON a."respondedBy" = responder.id
      ${whereSQL}
      ORDER BY 
        CASE a.status 
          WHEN 'pending' THEN 1 
          ELSE 2 
        END,
        a."requestedAt" DESC
    `, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: approvals.length,
            data: approvals
        });
    } catch (error) {
        console.error('Error getting approvals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approvals',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get single approval
// @route   GET /api/approvals/:id
// @access  Private
exports.getApproval = async (req, res) => {
    try {
        const { id } = req.params;

        const [approval] = await sequelize.query(`
      SELECT 
        a.*,
        p.name as "projectName",
        ps."stageName",
        requester.name as "requestedByName",
        requester.email as "requestedByEmail",
        requester.avatar as "requestedByAvatar",
        approver.name as "requestedToName",
        approver.email as "requestedToEmail",
        approver.avatar as "requestedToAvatar",
        responder.name as "respondedByName"
      FROM approvals a
      LEFT JOIN projects p ON a."projectId" = p.id
      LEFT JOIN project_stages ps ON a."stageId" = ps.id
      LEFT JOIN users requester ON a."requestedBy" = requester.id
      LEFT JOIN users approver ON a."requestedTo" = approver.id
      LEFT JOIN users responder ON a."respondedBy" = responder.id
      WHERE a.id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        if (approval.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Approval not found'
            });
        }

        res.status(200).json({
            success: true,
            data: approval[0]
        });
    } catch (error) {
        console.error('Error getting approval:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approval',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Create approval request
// @route   POST /api/approvals
// @access  Private
exports.createApproval = async (req, res) => {
    try {
        const {
            title,
            description,
            projectId,
            stageId,
            deliverableId,
            taskId,
            requestedTo,
            approvalType,
            priority = 'medium',
            dueDate
        } = req.body;

        if (!title || !requestedTo || !approvalType) {
            return res.status(400).json({
                success: false,
                message: 'title, requestedTo, and approvalType are required'
            });
        }

        const [result] = await sequelize.query(`
      INSERT INTO approvals (
        title, description, "projectId", "stageId", "deliverableId", "taskId",
        "requestedBy", "requestedTo", "approvalType", priority, "dueDate",
        status, "requestedAt", "createdAt", "updatedAt"
      ) VALUES (
        :title, :description, :projectId, :stageId, :deliverableId, :taskId,
        :requestedBy, :requestedTo, :approvalType, :priority, :dueDate,
        'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `, {
            replacements: {
                title,
                description: description || null,
                projectId: projectId || null,
                stageId: stageId || null,
                deliverableId: deliverableId || null,
                taskId: taskId || null,
                requestedBy: req.user.id,
                requestedTo,
                approvalType,
                priority,
                dueDate: dueDate || null
            },
            type: sequelize.QueryTypes.INSERT
        });

        // Create notification for approver
        await sequelize.query(`
      INSERT INTO notifications (
        "userId", title, message, type, "relatedId", "relatedType",
        link, priority, "actionRequired", "createdAt", "updatedAt"
      ) VALUES (
        :userId, :notifTitle, :message, 'approval', :approvalId, 'approval',
        :link, :priority, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `, {
            replacements: {
                userId: requestedTo,
                notifTitle: 'New Approval Request',
                message: `${req.user.name} requested your approval for: ${title}`,
                approvalId: result[0][0].id,
                link: `/approvals/${result[0][0].id}`,
                priority: priority === 'urgent' ? 'high' : 'normal'
            },
            type: sequelize.QueryTypes.INSERT
        });

        // Log activity
        if (projectId) {
            await logActivity({
                userId: req.user.id,
                projectId: parseInt(projectId),
                type: 'approval_requested',
                description: `Approval requested: ${title}`
            });
        }

        res.status(201).json({
            success: true,
            data: result[0][0]
        });
    } catch (error) {
        console.error('Error creating approval:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create approval',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Respond to approval (approve/reject)
// @route   PUT /api/approvals/:id/respond
// @access  Private
exports.respondToApproval = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { status, comments, rejectionReason } = req.body;

        if (!status || !['approved', 'rejected', 'revision_requested'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status (approved/rejected/revision_requested) is required'
            });
        }

        // Get approval
        const [approval] = await sequelize.query(`
      SELECT * FROM approvals WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (approval.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Approval not found'
            });
        }

        // Check if user is authorized to respond
        if (approval[0].requestedTo !== req.user.id && req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this approval'
            });
        }

        // Update approval
        await sequelize.query(`
      UPDATE approvals
      SET status = :status,
          comments = :comments,
          "rejectionReason" = :rejectionReason,
          "respondedBy" = :respondedBy,
          "respondedAt" = CURRENT_TIMESTAMP,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = :id
    `, {
            replacements: {
                id,
                status,
                comments: comments || null,
                rejectionReason: status === 'rejected' ? rejectionReason : null,
                respondedBy: req.user.id
            },
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        // Notify requester
        await sequelize.query(`
      INSERT INTO notifications (
        "userId", title, message, type, "relatedId", "relatedType",
        link, priority, "actionRequired", "createdAt", "updatedAt"
      ) VALUES (
        :userId, :title, :message, 'approval', :approvalId, 'approval',
        :link, 'high', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `, {
            replacements: {
                userId: approval[0].requestedBy,
                title: `Approval ${status}`,
                message: `Your approval request "${approval[0].title}" was ${status}`,
                approvalId: id,
                link: `/approvals/${id}`
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        // Log activity
        if (approval[0].projectId) {
            await logActivity({
                userId: req.user.id,
                projectId: approval[0].projectId,
                type: `approval_${status}`,
                description: `Approval ${status}: ${approval[0].title}`
            });
        }

        await transaction.commit();

        // Get updated approval
        const [updatedApproval] = await sequelize.query(`
      SELECT 
        a.*,
        p.name as "projectName",
        requester.name as "requestedByName",
        approver.name as "requestedToName",
        responder.name as "respondedByName"
      FROM approvals a
      LEFT JOIN projects p ON a."projectId" = p.id
      LEFT JOIN users requester ON a."requestedBy" = requester.id
      LEFT JOIN users approver ON a."requestedTo" = approver.id
      LEFT JOIN users responder ON a."respondedBy" = responder.id
      WHERE a.id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: updatedApproval[0]
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error responding to approval:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to respond to approval',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Cancel approval request
// @route   PUT /api/approvals/:id/cancel
// @access  Private (Requester only)
exports.cancelApproval = async (req, res) => {
    try {
        const { id } = req.params;

        // Get approval
        const [approval] = await sequelize.query(`
      SELECT * FROM approvals WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        if (approval.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Approval not found'
            });
        }

        // Check if user is the requester
        if (approval[0].requestedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this approval'
            });
        }

        // Update status to cancelled
        await sequelize.query(`
      UPDATE approvals
      SET status = 'cancelled',
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.UPDATE
        });

        res.status(200).json({
            success: true,
            message: 'Approval cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling approval:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel approval',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get pending approvals count
// @route   GET /api/approvals/pending/count
// @access  Private
exports.getPendingCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const [result] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM approvals
      WHERE "requestedTo" = :userId AND status = 'pending'
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: parseInt(result[0].count)
        });
    } catch (error) {
        console.error('Error getting pending count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending count',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
