const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { Blocker, Project, Task, User } = require('../models/sql');

router.use(protect);

// Get all blockers with filters
router.get('/', async (req, res) => {
    try {
        const { projectId, status, priority } = req.query;
        const where = {};

        // Filter by user's projects if not admin/PM
        const userRole = req.user.role?.toLowerCase();
        if (userRole !== 'admin' && userRole !== 'project manager') {
            where.reportedBy = req.user.id;
        }

        if (projectId) where.projectId = parseInt(projectId);
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const blockers = await Blocker.findAll({
            where,
            include: [
                { model: Project, as: 'project', attributes: ['id', 'name'] },
                { model: Task, as: 'task', attributes: ['id', 'title'], required: false },
                { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'resolver', attributes: ['id', 'name', 'email'], required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: blockers });
    } catch (error) {
        console.error('Error fetching blockers:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blockers', error: error.message });
    }
});

// Create a new blocker
router.post('/', async (req, res) => {
    try {
        console.log('Creating blocker with data:', req.body);
        const { title, description, priority, taskId, projectId } = req.body;

        if (!title || !description || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and project ID are required'
            });
        }

        const blockerData = {
            title,
            description,
            priority: priority || 'medium',
            taskId: taskId && taskId !== '' ? parseInt(taskId) : null,
            projectId: parseInt(projectId),
            reportedBy: req.user.id,
            status: 'open'
        };

        console.log('Processed blocker data:', blockerData);

        const blocker = await Blocker.create(blockerData);

        const createdBlocker = await Blocker.findByPk(blocker.id, {
            include: [
                { model: Project, as: 'project', attributes: ['id', 'name'] },
                { model: Task, as: 'task', attributes: ['id', 'title'], required: false },
                { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }
            ]
        });

        res.status(201).json({ success: true, data: createdBlocker });
    } catch (error) {
        console.error('CRITICAL ERROR creating blocker:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create blocker',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update blocker status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const blocker = await Blocker.findByPk(req.params.id);

        if (!blocker) {
            return res.status(404).json({ success: false, message: 'Blocker not found' });
        }

        // Only reporter or admin can update
        if (blocker.reportedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updateData = { status };
        if (status === 'resolved' || status === 'closed') {
            updateData.resolvedBy = req.user.id;
            updateData.resolvedAt = new Date();
        }

        await blocker.update(updateData);

        const updatedBlocker = await Blocker.findByPk(req.params.id, {
            include: [
                { model: Project, as: 'project', attributes: ['id', 'name'] },
                { model: Task, as: 'task', attributes: ['id', 'title'], required: false },
                { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'resolver', attributes: ['id', 'name', 'email'], required: false }
            ]
        });

        res.json({ success: true, data: updatedBlocker });
    } catch (error) {
        console.error('Error updating blocker:', error);
        res.status(500).json({ success: false, message: 'Failed to update blocker' });
    }
});

// Delete blocker
router.delete('/:id', async (req, res) => {
    try {
        const blocker = await Blocker.findByPk(req.params.id);

        if (!blocker) {
            return res.status(404).json({ success: false, message: 'Blocker not found' });
        }

        // Only reporter or admin can delete
        if (blocker.reportedBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await blocker.destroy();
        res.json({ success: true, message: 'Blocker deleted successfully' });
    } catch (error) {
        console.error('Error deleting blocker:', error);
        res.status(500).json({ success: false, message: 'Failed to delete blocker' });
    }
});

module.exports = router;
