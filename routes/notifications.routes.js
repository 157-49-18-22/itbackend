const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    sendBulkNotifications
} = require('../controllers/notifications.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/notifications - Get user notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/mark-all-read - Mark all as read
router.put('/mark-all-read', markAllAsRead);

// POST /api/notifications - Create notification (admin only)
router.post('/', authorize('Admin'), createNotification);

// POST /api/notifications/bulk - Send bulk notifications (admin only)
router.post('/bulk', authorize('Admin'), sendBulkNotifications);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;
