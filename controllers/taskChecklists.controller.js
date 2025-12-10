const { sequelize } = require('../config/database');
const { logActivity } = require('../utils/activity.utils');

// @desc    Get all checklist items for a task
// @route   GET /api/tasks/:taskId/checklist
// @access  Private
exports.getTaskChecklist = async (req, res) => {
    try {
        const { taskId } = req.params;

        const [items] = await sequelize.query(`
      SELECT 
        tc.*,
        u.name as "completedByName",
        u.email as "completedByEmail"
      FROM task_checklists tc
      LEFT JOIN users u ON tc."completedBy" = u.id
      WHERE tc."taskId" = :taskId
      ORDER BY tc."orderIndex" ASC, tc."createdAt" ASC
    `, {
            replacements: { taskId },
            type: sequelize.QueryTypes.SELECT
        });

        // Calculate completion percentage
        const total = items.length;
        const completed = items.filter(item => item.isCompleted).length;
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.status(200).json({
            success: true,
            count: items.length,
            completionPercentage,
            data: items
        });
    } catch (error) {
        console.error('Error getting task checklist:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task checklist',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Create checklist item
// @route   POST /api/tasks/:taskId/checklist
// @access  Private
exports.createChecklistItem = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, dueDate, priority = 'medium', orderIndex } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Get next order index if not provided
        let finalOrderIndex = orderIndex;
        if (finalOrderIndex === undefined) {
            const [maxOrder] = await sequelize.query(`
        SELECT COALESCE(MAX("orderIndex"), -1) + 1 as "nextOrder"
        FROM task_checklists
        WHERE "taskId" = :taskId
      `, {
                replacements: { taskId },
                type: sequelize.QueryTypes.SELECT
            });
            finalOrderIndex = maxOrder[0].nextOrder;
        }

        const [result] = await sequelize.query(`
      INSERT INTO task_checklists (
        "taskId", title, description, "dueDate", priority,
        "orderIndex", "isCompleted", "createdAt", "updatedAt"
      ) VALUES (
        :taskId, :title, :description, :dueDate, :priority,
        :orderIndex, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `, {
            replacements: {
                taskId,
                title: title.trim(),
                description: description || null,
                dueDate: dueDate || null,
                priority,
                orderIndex: finalOrderIndex
            },
            type: sequelize.QueryTypes.INSERT
        });

        // Get task project ID for activity log
        const [task] = await sequelize.query(`
      SELECT "projectId" FROM tasks WHERE id = :taskId
    `, {
            replacements: { taskId },
            type: sequelize.QueryTypes.SELECT
        });

        if (task.length > 0 && task[0].projectId) {
            await logActivity({
                userId: req.user.id,
                projectId: task[0].projectId,
                type: 'checklist_item_added',
                description: `Checklist item "${title}" added to task`
            });
        }

        res.status(201).json({
            success: true,
            data: result[0][0]
        });
    } catch (error) {
        console.error('Error creating checklist item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checklist item',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update checklist item
// @route   PUT /api/tasks/:taskId/checklist/:itemId
// @access  Private
exports.updateChecklistItem = async (req, res) => {
    try {
        const { taskId, itemId } = req.params;
        const { title, description, isCompleted, dueDate, priority, orderIndex } = req.body;

        // Check if item exists
        const [existing] = await sequelize.query(`
      SELECT * FROM task_checklists WHERE id = :itemId AND "taskId" = :taskId
    `, {
            replacements: { itemId, taskId },
            type: sequelize.QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Checklist item not found'
            });
        }

        // Build update query
        const updates = [];
        const replacements = { itemId, taskId };

        if (title !== undefined) {
            updates.push('title = :title');
            replacements.title = title.trim();
        }
        if (description !== undefined) {
            updates.push('description = :description');
            replacements.description = description;
        }
        if (isCompleted !== undefined) {
            updates.push('"isCompleted" = :isCompleted');
            replacements.isCompleted = isCompleted;

            if (isCompleted && !existing[0].isCompleted) {
                updates.push('"completedBy" = :completedBy');
                updates.push('"completedAt" = CURRENT_TIMESTAMP');
                replacements.completedBy = req.user.id;
            } else if (!isCompleted && existing[0].isCompleted) {
                updates.push('"completedBy" = NULL');
                updates.push('"completedAt" = NULL');
            }
        }
        if (dueDate !== undefined) {
            updates.push('"dueDate" = :dueDate');
            replacements.dueDate = dueDate;
        }
        if (priority !== undefined) {
            updates.push('priority = :priority');
            replacements.priority = priority;
        }
        if (orderIndex !== undefined) {
            updates.push('"orderIndex" = :orderIndex');
            replacements.orderIndex = orderIndex;
        }

        updates.push('"updatedAt" = CURRENT_TIMESTAMP');

        if (updates.length > 0) {
            await sequelize.query(`
        UPDATE task_checklists 
        SET ${updates.join(', ')}
        WHERE id = :itemId AND "taskId" = :taskId
      `, {
                replacements,
                type: sequelize.QueryTypes.UPDATE
            });
        }

        // Get updated item
        const [item] = await sequelize.query(`
      SELECT 
        tc.*,
        u.name as "completedByName",
        u.email as "completedByEmail"
      FROM task_checklists tc
      LEFT JOIN users u ON tc."completedBy" = u.id
      WHERE tc.id = :itemId
    `, {
            replacements: { itemId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: item[0]
        });
    } catch (error) {
        console.error('Error updating checklist item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update checklist item',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete checklist item
// @route   DELETE /api/tasks/:taskId/checklist/:itemId
// @access  Private
exports.deleteChecklistItem = async (req, res) => {
    try {
        const { taskId, itemId } = req.params;

        // Check if item exists
        const [existing] = await sequelize.query(`
      SELECT * FROM task_checklists WHERE id = :itemId AND "taskId" = :taskId
    `, {
            replacements: { itemId, taskId },
            type: sequelize.QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Checklist item not found'
            });
        }

        // Delete item
        await sequelize.query(`
      DELETE FROM task_checklists WHERE id = :itemId
    `, {
            replacements: { itemId },
            type: sequelize.QueryTypes.DELETE
        });

        res.status(200).json({
            success: true,
            message: 'Checklist item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete checklist item',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Toggle checklist item completion
// @route   PATCH /api/tasks/:taskId/checklist/:itemId/toggle
// @access  Private
exports.toggleChecklistItem = async (req, res) => {
    try {
        const { taskId, itemId } = req.params;

        // Get current status
        const [existing] = await sequelize.query(`
      SELECT "isCompleted" FROM task_checklists 
      WHERE id = :itemId AND "taskId" = :taskId
    `, {
            replacements: { itemId, taskId },
            type: sequelize.QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Checklist item not found'
            });
        }

        const newStatus = !existing[0].isCompleted;

        // Toggle status
        if (newStatus) {
            await sequelize.query(`
        UPDATE task_checklists 
        SET "isCompleted" = true,
            "completedBy" = :userId,
            "completedAt" = CURRENT_TIMESTAMP,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = :itemId
      `, {
                replacements: { itemId, userId: req.user.id },
                type: sequelize.QueryTypes.UPDATE
            });
        } else {
            await sequelize.query(`
        UPDATE task_checklists 
        SET "isCompleted" = false,
            "completedBy" = NULL,
            "completedAt" = NULL,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = :itemId
      `, {
                replacements: { itemId },
                type: sequelize.QueryTypes.UPDATE
            });
        }

        // Get updated item
        const [item] = await sequelize.query(`
      SELECT 
        tc.*,
        u.name as "completedByName"
      FROM task_checklists tc
      LEFT JOIN users u ON tc."completedBy" = u.id
      WHERE tc.id = :itemId
    `, {
            replacements: { itemId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: item[0]
        });
    } catch (error) {
        console.error('Error toggling checklist item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle checklist item',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Reorder checklist items
// @route   PUT /api/tasks/:taskId/checklist/reorder
// @access  Private
exports.reorderChecklistItems = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { items } = req.body; // Array of { id, orderIndex }

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Items must be an array'
            });
        }

        // Update order for each item
        for (const item of items) {
            await sequelize.query(`
        UPDATE task_checklists 
        SET "orderIndex" = :orderIndex,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = :id AND "taskId" = :taskId
      `, {
                replacements: {
                    id: item.id,
                    orderIndex: item.orderIndex,
                    taskId
                },
                type: sequelize.QueryTypes.UPDATE
            });
        }

        // Get updated list
        const [updatedItems] = await sequelize.query(`
      SELECT * FROM task_checklists 
      WHERE "taskId" = :taskId
      ORDER BY "orderIndex" ASC
    `, {
            replacements: { taskId },
            type: sequelize.QueryTypes.SELECT
        });

        res.status(200).json({
            success: true,
            data: updatedItems
        });
    } catch (error) {
        console.error('Error reordering checklist items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder checklist items',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
