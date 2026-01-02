const { Mockup, Project, User, sequelize } = require('../models/sql');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/mockups');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Save file to local storage
const saveFile = (file) => {
    try {
        const fileExt = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        // Move file from temp to uploads directory
        fs.renameSync(file.path, filePath);

        // Return relative path
        return `/uploads/mockups/${fileName}`;
    } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file');
    }
};

// Delete file from local storage
const deleteFile = (filePath) => {
    try {
        if (filePath) {
            const fullPath = path.join(__dirname, '../..', filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

// Create a new mockup
exports.createMockup = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        const { title, description, version, status, category, projectId } = req.body;
        const userId = req.user?.id;

        // Basic validation
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        // projectId is optional in Mockup model (allowNull: true)

        // Make image optional
        let image_url = null;
        if (req.file) {
            try {
                // Save file to local storage
                image_url = saveFile(req.file);
            } catch (fileError) {
                console.error('Error saving file:', fileError);
                return res.status(400).json({
                    success: false,
                    error: 'Failed to save the uploaded file',
                    details: process.env.NODE_ENV === 'development' ? fileError.message : undefined
                });
            }
        }

        const mockupData = {
            title,
            description: description || '',
            version: version || '1.0',
            status: status || 'draft',
            category: category || 'web',
            project_id: projectId || null,
            created_by: userId,
            // createdBy is mapped to created_by in Model definition but using the JS key 'created_by' as defined in define()
        };

        // Only add image_url if it exists
        if (image_url) {
            mockupData.image_url = image_url;
        }

        const mockup = await Mockup.create(mockupData);

        res.status(201).json({
            success: true,
            data: mockup,
        });
    } catch (error) {
        console.error('Error creating mockup:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create mockup',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Get all mockups with optional filtering
exports.getMockups = async (req, res) => {
    try {
        const { projectId, search, status, category } = req.query;
        const where = {};

        if (projectId) {
            where.project_id = projectId;
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        const mockups = await Mockup.findAll({
            where,
            order: [['created_at', 'DESC']], // underscored: true means createdAt is created_at in DB, but Sequelize maps it?
            // Wait, Mockup model uses timestamps: true and underscored: true.
            // Usually accessing via 'createdAt' works in JS.
            // Let's use 'createdAt' in order array if Sequelize handles aliasing, which it should.
            // SAFE BET: use 'createdAt' because Sequelize maps it.
            // Actually, looking at wireframe.controller, it used 'createdAt'.
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email', 'avatar'],
                },
            ],
        });

        res.status(200).json({
            success: true,
            data: mockups,
        });
    } catch (error) {
        console.error('Error fetching mockups:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch mockups',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Get a single mockup by ID
exports.getMockupById = async (req, res) => {
    try {
        const { id } = req.params;
        const mockup = await Mockup.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email', 'avatar'],
                },
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'description'],
                },
            ],
        });

        if (!mockup) {
            return res.status(404).json({
                success: false,
                error: 'Mockup not found',
            });
        }

        res.status(200).json({
            success: true,
            data: mockup,
        });
    } catch (error) {
        console.error('Error fetching mockup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch mockup',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Update a mockup
exports.updateMockup = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, version, status, category, projectId } = req.body;
        // const userId = req.user.id; 

        const mockup = await Mockup.findByPk(id);
        if (!mockup) {
            return res.status(404).json({
                success: false,
                error: 'Mockup not found',
            });
        }

        // If a new image is uploaded
        let image_url = mockup.image_url;
        if (req.file) {
            // Delete old image from storage if it exists
            if (image_url) {
                deleteFile(image_url);
            }
            // Save new image
            image_url = saveFile(req.file);
        }

        // Prepare update data
        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (version) updateData.version = version;
        if (status) updateData.status = status;
        if (category) updateData.category = category;
        if (projectId) updateData.project_id = projectId;
        if (req.file) updateData.image_url = image_url;

        // Update mockup
        await mockup.update(updateData);

        res.status(200).json({
            success: true,
            data: mockup,
        });
    } catch (error) {
        console.error('Error updating mockup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update mockup',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Delete a mockup
exports.deleteMockup = async (req, res) => {
    try {
        const { id } = req.params;

        // Find with paranoid: false to check if it exists even if soft deleted (though here we just want active ones)
        const mockup = await Mockup.findByPk(id);

        if (!mockup) {
            return res.status(404).json({
                success: false,
                error: 'Mockup not found',
            });
        }

        // Delete image from storage
        // Note: If using soft delete, maybe we shouldn't delete the file yet? 
        // Wireframes used hard delete. Mockups use soft delete (paranoid: true).
        // If I delete the file, and then restore the record, the file is gone.
        // So for soft deletes, DO NOT delete the file.
        // However, if the user asking for "delete function" expects it to be gone, maybe I should use force: true?

        // User asked for "delete or edit btn full function".
        // I will use standard destroy() which is soft delete.
        // I will NOT delete the file.

        await mockup.destroy();

        res.status(200).json({
            success: true,
            message: 'Mockup deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting mockup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete mockup',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Get mockup statistics for dashboard
exports.getMockupStats = async (req, res) => {
    try {
        const { projectId } = req.params;

        const stats = await Mockup.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { project_id: projectId },
            group: ['status'],
            raw: true,
        });

        // Format stats
        const formattedStats = {
            total: 0,
            byStatus: {},
        };

        stats.forEach(stat => {
            formattedStats.total += parseInt(stat.count);
            formattedStats.byStatus[stat.status] = parseInt(stat.count);
        });

        res.status(200).json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        console.error('Error fetching mockup stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch mockup statistics',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
