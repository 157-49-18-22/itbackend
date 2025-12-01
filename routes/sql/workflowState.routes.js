const express = require('express');
const router = express.Router();
const workflowStateController = require('../../controllers/sql/workflowState.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Workflow State
 *   description: Project workflow state management
 */

/**
 * @swagger
 * /api/workflow/projects/{projectId}/state:
 *   get:
 *     summary: Get current workflow state for a project
 *     tags: [Workflow State]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the project
 *     responses:
 *       200:
 *         description: Workflow state retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/projects/:projectId/state', authorize(['admin', 'project_manager', 'developer']), workflowStateController.getWorkflowState);

/**
 * @swagger
 * /api/workflow/projects/{projectId}/state:
 *   put:
 *     summary: Update workflow state
 *     tags: [Workflow State]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 enum: [RequirementGathering, Wireframing, Design, Development, Testing, UAT, Deployment, Completed]
 *                 description: The new workflow state
 *               status:
 *                 type: string
 *                 enum: [Not Started, In Progress, Completed, Blocked]
 *                 description: The status of the current state
 *               notes:
 *                 type: string
 *                 description: Optional notes about the state change
 *     responses:
 *       200:
 *         description: Workflow state updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.put('/projects/:projectId/state', authorize(['admin', 'project_manager']), workflowStateController.updateWorkflowState);

/**
 * @swagger
 * /api/workflow/projects/{projectId}/history:
 *   get:
 *     summary: Get workflow history for a project
 *     tags: [Workflow State]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the project
 *     responses:
 *       200:
 *         description: Workflow history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/projects/:projectId/history', authorize(['admin', 'project_manager']), workflowStateController.getWorkflowHistory);

module.exports = router;
