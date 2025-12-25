const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { Feedback, Project, Task, User } = require('../models/sql');

router.use(protect);

// Get all feedbacks for current user
router.get('/', async (req, res) => {
    try {
        const { projectId, status, type } = req.query;
        const where = {};

        // Developers see feedback given to them
        // Admins/Reviewers see all feedback
        if (req.user.role === 'developer') {
            where.developerId = req.user.id;
        }

        if (projectId) where.projectId = projectId;
        if (status) where.status = status;
        if (type) where.type = type;

        const feedbacks = await Feedback.findAll({
            where,
            include: [
                { model: Project, as: 'project', attributes: ['id', 'name'] },
                { model: Task, as: 'task', attributes: ['id', 'title'], required: false },
                { model: User, as: 'reviewer', attributes: ['id', 'name', 'email', 'role'] },
                { model: User, as: 'developer', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: feedbacks });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch feedbacks' });
    }
});

// Create new feedback (Admin/Reviewer only)
router.post('/', async (req, res) => {
    try {
        const { type, taskId, projectId, taskName, feedback, suggestions, priority, developerId } = req.body;

        if (!type || !projectId || !taskName || !feedback || !developerId) {
            return res.status(400).json({
                success: false,
                message: 'Type, project ID, task name, feedback, and developer ID are required'
            });
        }

        // Only admin, project manager, or senior devs can give feedback
        if (!['admin', 'project_manager', 'senior_developer'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to give feedback'
            });
        }

        const feedbackEntry = await Feedback.create({
            type,
            taskId: taskId || null,
            projectId,
            taskName,
            feedback,
            suggestions: suggestions || [],
            priority: priority || 'medium',
            reviewerId: req.user.id,
            developerId,
            status: 'pending'
        });

        const createdFeedback = await Feedback.findByPk(feedbackEntry.id, {
            include: [
                { model: Project, as: 'project', attributes: ['id', 'name'] },
                { model: Task, as: 'task', attributes: ['id', 'title'], required: false },
                { model: User, as: 'reviewer', attributes: ['id', 'name', 'email', 'role'] },
                { model: User, as: 'developer', attributes: ['id', 'name', 'email'] }
            ]
        });

        res.status(201).json({ success: true, data: createdFeedback });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to create feedback' });
    }
});

// Mark feedback as addressed
router.patch('/:id/address', async (req, res) => {
    try {
        const feedback = await Feedback.findByPk(req.params.id);

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        // Only the developer who received feedback can mark it as addressed
        if (feedback.developerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await feedback.update({
            status: 'addressed',
            addressedAt: new Date()
        });

        const updatedFeedback = await Feedback.findByPk(req.params.id, {
            include: [
                { model: Project, as: 'project', attributes: ['id', 'name'] },
                { model: Task, as: 'task', attributes: ['id', 'title'], required: false },
                { model: User, as: 'reviewer', attributes: ['id', 'name', 'email', 'role'] },
                { model: User, as: 'developer', attributes: ['id', 'name', 'email'] }
            ]
        });

        res.json({ success: true, data: updatedFeedback });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to update feedback' });
    }
});

// Delete feedback (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const feedback = await Feedback.findByPk(req.params.id);

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        await feedback.destroy();
        res.json({ success: true, message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to delete feedback' });
    }
});

module.exports = router;
