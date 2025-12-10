const { sequelize } = require('../config/database');
const { logActivity } = require('../utils/activity.utils');

// @desc    Get comments for a specific entity (project/task/deliverable/bug)
// @route   GET /api/comments
// @access  Private
exports.getComments = async (req, res) => {
    try {
        const { projectId, taskId, deliverableId, bugId } = req.query;

        if (!projectId && !taskId && !deliverableId && !bugId) {
            return res.status(400).json({
                success: false,
                message: 'At least one of projectId, taskId, deliverableId, or bugId is required'
            });
        }

        let whereClause = [];
        const replacements = {};

        if (projectId) {
            whereClause.push('c."projectId" = :projectId');
            replacements.projectId = projectId;
        }
        if (taskId) {
            whereClause.push('c."taskId" = :taskId');
            replacements.taskId = taskId;
        }
        if (deliverableId) {
            whereClause.push('c."deliverableId" = :deliverableId');
            replacements.deliverableId = deliverableId;
        }
        if (bugId) {
            whereClause.push('c."bugId" = :bugId');
            replacements.bugId = bugId;
        }

        const [comments] = await sequelize.query(`
      SELECT 
        c.*,
        u.name as "userName",
        u.email as "userEmail",
        u.avatar as "userAvatar",
        u.role as "userRole",
        COUNT(DISTINCT r.id) as "replyCount"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      LEFT JOIN comments r ON r."parentCommentId" = c.id
      WHERE ${whereClause.join(' OR ')}
      AND c."parentCommentId" IS NULL
      GROUP BY c.id, u.name, u.email, u.avatar, u.role
      ORDER BY c."createdAt" DESC
    `, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get comment with replies
// @route   GET /api/comments/:id
// @access  Private
exports.getCommentWithReplies = async (req, res) => {
    try {
        const { id } = req.params;

        // Get main comment
        const [comment] = await sequelize.query(`
      SELECT 
        c.*,
        u.name as "userName",
        u.email as "userEmail",
        u.avatar as "userAvatar",
        u.role as "userRole"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      WHERE c.id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        if (comment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Get replies
        const [replies] = await sequelize.query(`
      SELECT 
        c.*,
        u.name as "userName",
        u.email as "userEmail",
        u.avatar as "userAvatar",
        u.role as "userRole"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      WHERE c."parentCommentId" = :id
      ORDER BY c."createdAt" ASC
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: {
                ...comment[0],
                replies
            }
        });
    } catch (error) {
        console.error('Error getting comment with replies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
    try {
        const {
            projectId,
            taskId,
            deliverableId,
            bugId,
            commentText,
            parentCommentId
        } = req.body;

        if (!commentText || commentText.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        if (!projectId && !taskId && !deliverableId && !bugId) {
            return res.status(400).json({
                success: false,
                message: 'At least one of projectId, taskId, deliverableId, or bugId is required'
            });
        }

        const [result] = await sequelize.query(`
      INSERT INTO comments (
        "projectId", "taskId", "deliverableId", "bugId",
        "userId", "commentText", "parentCommentId",
        "createdAt", "updatedAt"
      ) VALUES (
        :projectId, :taskId, :deliverableId, :bugId,
        :userId, :commentText, :parentCommentId,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `, {
            replacements: {
                projectId: projectId || null,
                taskId: taskId || null,
                deliverableId: deliverableId || null,
                bugId: bugId || null,
                userId: req.user.id,
                commentText: commentText.trim(),
                parentCommentId: parentCommentId || null
            },
            type: sequelize.QueryTypes.INSERT
        });

        // Get created comment with user details
        const [comment] = await sequelize.query(`
      SELECT 
        c.*,
        u.name as "userName",
        u.email as "userEmail",
        u.avatar as "userAvatar",
        u.role as "userRole"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      WHERE c.id = :id
    `, {
            replacements: { id: result[0][0].id },
            type: sequelize.QueryTypes.SELECT
        });

        // Create notification for mentioned users (if any)
        const mentionRegex = /@(\w+)/g;
        const mentions = commentText.match(mentionRegex);

        if (mentions && mentions.length > 0) {
            const usernames = mentions.map(m => m.substring(1));

            const [mentionedUsers] = await sequelize.query(`
        SELECT id FROM users WHERE name = ANY(:usernames)
      `, {
                replacements: { usernames },
                type: sequelize.QueryTypes.SELECT
            });

            for (const user of mentionedUsers) {
                await sequelize.query(`
          INSERT INTO notifications (
            "userId", title, message, type, "relatedId", "relatedType",
            link, priority, "actionRequired", "createdAt", "updatedAt"
          ) VALUES (
            :userId, :title, :message, 'mention', :commentId, 'comment',
            :link, 'normal', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `, {
                    replacements: {
                        userId: user.id,
                        title: 'You were mentioned in a comment',
                        message: `${req.user.name} mentioned you: "${commentText.substring(0, 100)}..."`,
                        commentId: result[0][0].id,
                        link: projectId ? `/projects/${projectId}` : taskId ? `/tasks/${taskId}` : '#'
                    },
                    type: sequelize.QueryTypes.INSERT
                });
            }
        }

        // Log activity
        if (projectId) {
            await logActivity({
                userId: req.user.id,
                projectId: parseInt(projectId),
                type: 'comment_added',
                description: `Comment added to ${taskId ? 'task' : deliverableId ? 'deliverable' : bugId ? 'bug' : 'project'}`
            });
        }

        res.status(201).json({
            success: true,
            data: comment[0]
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create comment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Own comments only)
exports.updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentText } = req.body;

        if (!commentText || commentText.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        // Check if comment exists and belongs to user
        const [existing] = await sequelize.query(`
      SELECT * FROM comments WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (existing[0].userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        // Update comment
        await sequelize.query(`
      UPDATE comments 
      SET "commentText" = :commentText,
          "isEdited" = true,
          "editedAt" = CURRENT_TIMESTAMP,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = :id
    `, {
            replacements: { id, commentText: commentText.trim() },
            type: sequelize.QueryTypes.UPDATE
        });

        // Get updated comment
        const [comment] = await sequelize.query(`
      SELECT 
        c.*,
        u.name as "userName",
        u.email as "userEmail",
        u.avatar as "userAvatar",
        u.role as "userRole"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      WHERE c.id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: comment[0]
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update comment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Own comments or Admin)
exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if comment exists
        const [existing] = await sequelize.query(`
      SELECT * FROM comments WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (existing[0].userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Delete comment (cascade will delete replies)
        await sequelize.query(`
      DELETE FROM comments WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.DELETE
        });

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
