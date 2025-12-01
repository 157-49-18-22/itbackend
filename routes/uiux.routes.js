const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  getProjectTasks,
  getUserTasks,
  createTask,
  updateTaskStatus,
  uploadAttachment,
  logWorkTime,
  addComment,
  getTaskAnalytics
} = require('../controllers/uiux.controller');

// All routes are protected and require authentication
router.use(protect);

// User tasks route
router.route('/tasks/my-tasks')
  .get(authorize('user', 'admin'), getUserTasks);

// Project tasks routes
router.route('/projects/:projectId/tasks')
  .get(authorize('user', 'admin'), getProjectTasks)
  .post(authorize('admin', 'project_manager'), createTask);

// Task status update
router.route('/tasks/:taskId/status')
  .put(authorize('user', 'admin'), updateTaskStatus);

// Task attachments
router.route('/tasks/:taskId/attachments')
  .post(
    authorize('user', 'admin'),
    upload.single('file'),
    uploadAttachment
  );

// Time tracking
router.route('/tasks/:taskId/time-entries')
  .post(authorize('user', 'admin'), logWorkTime);

// Comments
router.route('/tasks/:taskId/comments')
  .post(authorize('user', 'admin'), addComment);

// Analytics
router.route('/projects/:projectId/analytics/tasks')
  .get(authorize('user', 'admin'), getTaskAnalytics);

module.exports = router;
