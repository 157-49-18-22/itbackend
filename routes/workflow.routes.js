const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const { auth, authorize } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Workflow
 *   description: Project workflow management
 */

/**
 * @swagger
 * /api/workflow/{projectId}/status:
 *   get:
 *     summary: Get workflow status for a project
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Workflow status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/status', authorize('read', 'Project'), workflowController.getWorkflowStatus);

/**
 * @swagger
 * /api/workflow/{projectId}/phase/{phase}:
 *   put:
 *     summary: Update workflow phase
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: phase
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ui-ux, development, testing, completion]
 *         description: Phase to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, blocked, completed]
 *                 default: in-progress
 *               notes:
 *                 type: string
 *                 description: Optional notes about the phase update
 *     responses:
 *       200:
 *         description: Workflow phase updated successfully
 *       400:
 *         description: Invalid phase or status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.put('/:projectId/phase/:phase', authorize('update', 'Project'), workflowController.updatePhase);

/**
 * @swagger
 * /api/workflow/{projectId}/phase/{phase}/complete:
 *   post:
 *     summary: Mark a phase as completed
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: phase
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ui-ux, development, testing, completion]
 *         description: Phase to mark as completed
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Optional notes about the phase completion
 *     responses:
 *       200:
 *         description: Phase marked as completed successfully
 *       400:
 *         description: Invalid phase
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.post('/:projectId/phase/:phase/complete', authorize('update', 'Project'), workflowController.completePhase);

/**
 * @swagger
 * /api/workflow/{projectId}/phase/{phase}:
 *   get:
 *     summary: Get phase details
 *     tags: [Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: phase
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ui-ux, development, testing, completion]
 *         description: Phase to get details for
 *     responses:
 *       200:
 *         description: Phase details retrieved successfully
 *       400:
 *         description: Invalid phase
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/phase/:phase', authorize('read', 'Project'), workflowController.getPhaseDetails);

module.exports = router;
