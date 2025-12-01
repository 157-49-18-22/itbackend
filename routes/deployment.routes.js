const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createDeployment,
  getDeployments,
  getDeploymentById,
  updateDeploymentStatus,
  deleteDeployment
} = require('../controllers/deployment.controller');

// Public routes (if any)
// router.get('/', getDeployments);
// router.get('/:id', getDeploymentById);

// Protected routes
router.use(protect);

// All routes below this line will be protected and require authentication
router.route('/')
  .get(getDeployments)
  .post(createDeployment);

router.route('/:id')
  .get(getDeploymentById)
  .delete(deleteDeployment);

// Update deployment status (e.g., mark as completed/failed)
router.patch('/:id/status', updateDeploymentStatus);

// Get deployments by project
router.get('/project/:projectId', async (req, res, next) => {
  req.query.projectId = req.params.projectId;
  return getDeployments(req, res, next);
});

// Get deployments by environment
router.get('/environment/:environment', async (req, res, next) => {
  req.query.environment = req.params.environment;
  return getDeployments(req, res, next);
});

// Get deployment logs
router.get('/:id/logs', (req, res) => {
  // This would be implemented to get deployment logs
  res.status(200).json({
    success: true,
    data: {
      logs: 'Deployment logs would be shown here...',
      deploymentId: req.params.id
    }
  });
});

// Admin only routes
router.use(authorize('admin'));

// Any routes below this line will require admin role
// For example, deleting all deployments or getting all deployments across projects

module.exports = router;
