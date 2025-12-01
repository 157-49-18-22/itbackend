
const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/project.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect); // All routes require authentication

router.route('/')
  .get(getAllProjects)
  .post(authorize('Admin', 'Project Manager'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('Admin', 'Project Manager'), updateProject)
  .delete(authorize('Admin'), deleteProject);

router.get('/:id/stats', getProjectStats);

module.exports = router;
