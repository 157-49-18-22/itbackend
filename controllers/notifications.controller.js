const { sequelize } = require('../config/database');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { isRead, type, limit = 50, offset = 0 } = req.query;

        let whereClause = ['"userId" = :userId'];
        const replacements = { userId, limit: parseInt(limit), offset: parseInt(offset) };

        if (isRead !== undefined) {
            whereClause.push('"isRead" = :isRead');
            replacements.isRead = isRead === 'true';
        }

        if (type) {
            whereClause.push('type = :type');
            replacements.type = type;
        }

        const [notifications] = await sequelize.query(`
      SELECT * FROM notifications
      WHERE ${whereClause.join(' AND ')}
      ORDER BY "createdAt" DESC
      LIMIT :limit OFFSET :offset
    `, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        // Get total count
        const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM notifications
      WHERE ${whereClause.join(' AND ')}
    `, {
            replacements: { userId, isRead: replacements.isRead, type: replacements.type },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            total: parseInt(countResult[0].total),
            data: notifications
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const [result] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE "userId" = :userId AND "isRead" = false
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            count: parseInt(result[0].count)
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if notification belongs to user
        const [notification] = await sequelize.query(`
      SELECT * FROM notifications WHERE id = :id AND "userId" = :userId
    `, {
            replacements: { id, userId },
            type: sequelize.QueryTypes.SELECT
        });

        if (notification.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Mark as read
        await sequelize.query(`
      UPDATE notifications
      SET "isRead" = true,
          "readAt" = CURRENT_TIMESTAMP,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.UPDATE
        });

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await sequelize.query(`
      UPDATE notifications
      SET "isRead" = true,
          "readAt" = CURRENT_TIMESTAMP,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "userId" = :userId AND "isRead" = false
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.UPDATE
        });

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if notification belongs to user
        const [notification] = await sequelize.query(`
      SELECT * FROM notifications WHERE id = :id AND "userId" = :userId
    `, {
            replacements: { id, userId },
            type: sequelize.QueryTypes.SELECT
        });

        if (notification.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Delete notification
        await sequelize.query(`
      DELETE FROM notifications WHERE id = :id
    `, {
            replacements: { id },
            type: sequelize.QueryTypes.DELETE
        });

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Create notification (Internal use)
// @route   POST /api/notifications
// @access  Private (Admin only)
exports.createNotification = async (req, res) => {
    try {
        const {
            userId,
            title,
            message,
            type = 'info',
            relatedId,
            relatedType,
            link,
            priority = 'normal',
            actionRequired = false
        } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, title, and message are required'
            });
        }

        const [result] = await sequelize.query(`
      INSERT INTO notifications (
        "userId", title, message, type, "relatedId", "relatedType",
        link, priority, "actionRequired", "createdAt", "updatedAt"
      ) VALUES (
        :userId, :title, :message, :type, :relatedId, :relatedType,
        :link, :priority, :actionRequired, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `, {
            replacements: {
                userId,
                title,
                message,
                type,
                relatedId: relatedId || null,
                relatedType: relatedType || null,
                link: link || null,
                priority,
                actionRequired
            },
            type: sequelize.QueryTypes.INSERT
        });

        res.status(201).json({
            success: true,
            data: result[0][0]
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Send bulk notifications
// @route   POST /api/notifications/bulk
// @access  Private (Admin only)
exports.sendBulkNotifications = async (req, res) => {
    try {
        const { userIds, title, message, type = 'info', link, priority = 'normal' } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'userIds array is required'
            });
        }

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'title and message are required'
            });
        }

        // Create notifications for all users
        const values = userIds.map(userId =>
            `(${userId}, '${title}', '${message}', '${type}', '${link || ''}', '${priority}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        ).join(', ');

        await sequelize.query(`
      INSERT INTO notifications (
        "userId", title, message, type, link, priority, "createdAt", "updatedAt"
      ) VALUES ${values}
    `, {
            type: sequelize.QueryTypes.INSERT
        });

        res.status(201).json({
            success: true,
            message: `Notifications sent to ${userIds.length} users`
        });
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
