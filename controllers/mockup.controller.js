const { Mockup, Project, User } = require('../models/sql');
const { Op } = require('sequelize');
const { logActivity } = require('../utils/activity.utils');
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

// @desc    Create a new mockup
// @route   POST /api/mockups
// @access  Private
exports.createMockup = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { title, description, projectId, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Save the file
    const imageUrl = '/uploads/mockups/' + req.file.filename;

    const mockupData = {
      title,
      description: description || '',
      image_url: imageUrl, // Use snake_case to match database column
      category: category || 'Web App',
      created_by: req.user.id, // Make sure this is set
      status: 'draft'
    };

    // Add project_id only if provided
    if (projectId) {
      mockupData.project_id = projectId;
    }

    console.log('Creating mockup with data:', mockupData);

    const mockup = await Mockup.create(mockupData);

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'create',
      entityType: 'mockup',
      entityId: mockup.id,
      projectId: projectId || null,
      description: `Created new mockup: ${title}`
    });

    res.status(201).json({
      success: true,
      data: mockup
    });
  } catch (error) {
    console.error('Error creating mockup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create mockup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all mockups with optional filtering
// @route   GET /api/mockups
// @access  Private
exports.getMockups = async (req, res) => {
  try {
    const { projectId, status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: mockups } = await Mockup.findAndCountAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: mockups.length,
      total: count,
      data: mockups,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching mockups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mockups',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get a single mockup by ID
// @route   GET /api/mockups/:id
// @access  Private
exports.getMockupById = async (req, res) => {
  try {
    const mockup = await Mockup.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!mockup) {
      return res.status(404).json({
        success: false,
        message: 'Mockup not found'
      });
    }

    res.status(200).json({
      success: true,
      data: mockup
    });
  } catch (error) {
    console.error('Error fetching mockup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mockup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update a mockup
// @route   PUT /api/mockups/:id
// @access  Private
exports.updateMockup = async (req, res) => {
  try {
    const { title, description, status, feedback } = req.body;
    const mockup = await Mockup.findByPk(req.params.id);

    if (!mockup) {
      return res.status(404).json({
        success: false,
        message: 'Mockup not found'
      });
    }

    // Check permissions
    if (mockup.createdBy !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this mockup'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    
    // Handle file upload if included
    if (req.file) {
      // Delete old file
      if (mockup.imageUrl) {
        deleteFile(mockup.imageUrl);
      }
      updateData.imageUrl = saveFile(req.file);
    }

    // Handle status update (only for admins or approvers)
    if (status && req.user.roles.includes('admin')) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.approvedBy = req.user.id;
        updateData.approvedAt = new Date();
      } else if (status === 'rejected' && feedback) {
        updateData.feedback = feedback;
      }
    }

    await mockup.update(updateData);

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'update',
      entityType: 'mockup',
      entityId: mockup.id,
      projectId: mockup.projectId,
      description: `Updated mockup: ${mockup.title}`
    });

    res.status(200).json({
      success: true,
      data: mockup
    });
  } catch (error) {
    console.error('Error updating mockup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mockup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a mockup
// @route   DELETE /api/mockups/:id
// @access  Private
exports.deleteMockup = async (req, res) => {
  try {
    const mockup = await Mockup.findByPk(req.params.id);

    if (!mockup) {
      return res.status(404).json({
        success: false,
        message: 'Mockup not found'
      });
    }

    // Check permissions
    if (mockup.createdBy !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this mockup'
      });
    }

    // Delete the file
    if (mockup.imageUrl) {
      deleteFile(mockup.imageUrl);
    }

    await mockup.destroy();

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'delete',
      entityType: 'mockup',
      entityId: mockup.id,
      projectId: mockup.projectId,
      description: `Deleted mockup: ${mockup.title}`
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting mockup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mockup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get mockup statistics
// @route   GET /api/mockups/stats/:projectId
// @access  Private
exports.getMockupStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const stats = await Mockup.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { projectId },
      group: ['status']
    });

    const total = await Mockup.count({ where: { projectId } });

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: stats.reduce((acc, { status, count }) => ({
          ...acc,
          [status]: parseInt(count)
        }), {})
      }
    });
  } catch (error) {
    console.error('Error fetching mockup stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mockup statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


