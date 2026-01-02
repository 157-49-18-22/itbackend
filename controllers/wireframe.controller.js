const { Wireframe, Project, User, sequelize } = require('../models/sql');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/wireframes');
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
    return `/uploads/wireframes/${fileName}`;
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

// Create a new wireframe
exports.createWireframe = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { title, description, version, status, category, projectId } = req.body;
    const userId = req.user?.id; // Using optional chaining in case user is not set

    // Basic validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    // Make image optional
    let imageUrl = null;
    if (req.file) {
      try {
        // Save file to local storage
        imageUrl = saveFile(req.file);
      } catch (fileError) {
        console.error('Error saving file:', fileError);
        return res.status(400).json({
          success: false,
          error: 'Failed to save the uploaded file',
          details: process.env.NODE_ENV === 'development' ? fileError.message : undefined
        });
      }
    }

    const wireframeData = {
      title,
      description: description || '',
      version: version || '1.0',
      status: status || 'draft',
      category: category || 'web',
      projectId,
      createdBy: userId,
      updatedBy: userId,
    };

    // Only add imageUrl if it exists
    if (imageUrl) {
      wireframeData.imageUrl = imageUrl;
    }

    const wireframe = await Wireframe.create(wireframeData);

    res.status(201).json({
      success: true,
      data: wireframe,
    });
  } catch (error) {
    console.error('Error creating wireframe:', error);

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
      error: 'Failed to create wireframe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all wireframes with optional filtering
exports.getWireframes = async (req, res) => {
  try {
    const { projectId, search, status, category } = req.query;
    const where = {};

    // Only add projectId to where clause if it's provided
    if (projectId) {
      where.projectId = projectId;
    }

    // Add search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `% ${search}% ` } },
        { description: { [Op.like]: `% ${search}% ` } },
      ];
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add category filter
    if (category) {
      where.category = category;
    }

    const wireframes = await Wireframe.findAll({
      where,
      order: [['createdAt', 'DESC']],
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
      data: wireframes,
    });
  } catch (error) {
    console.error('Error fetching wireframes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wireframes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get a single wireframe by ID
exports.getWireframeById = async (req, res) => {
  try {
    const { id } = req.params;
    const wireframe = await Wireframe.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'name', 'email', 'avatar'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    if (!wireframe) {
      return res.status(404).json({
        success: false,
        error: 'Wireframe not found',
      });
    }

    res.status(200).json({
      success: true,
      data: wireframe,
    });
  } catch (error) {
    console.error('Error fetching wireframe:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wireframe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update a wireframe
exports.updateWireframe = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, version, status, category } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    const wireframe = await Wireframe.findByPk(id);
    if (!wireframe) {
      return res.status(404).json({
        success: false,
        error: 'Wireframe not found',
      });
    }

    // If a new image is uploaded
    let imageUrl = wireframe.imageUrl;
    if (req.file) {
      // Delete old image from storage
      if (imageUrl) {
        deleteFile(imageUrl);
      }
      // Save new image
      imageUrl = saveFile(req.file);
    }

    // Update wireframe
    await wireframe.update({
      title: title || wireframe.title,
      description: description !== undefined ? description : wireframe.description,
      version: version || wireframe.version,
      status: status || wireframe.status,
      category: category || wireframe.category,
      imageUrl,
      updatedBy: userId,
    });

    res.status(200).json({
      success: true,
      data: wireframe,
    });
  } catch (error) {
    console.error('Error updating wireframe:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wireframe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete a wireframe
exports.deleteWireframe = async (req, res) => {
  try {
    const { id } = req.params;

    const wireframe = await Wireframe.findByPk(id);
    if (!wireframe) {
      return res.status(404).json({
        success: false,
        error: 'Wireframe not found',
      });
    }

    // Delete image from storage
    if (wireframe.imageUrl) {
      deleteFile(wireframe.imageUrl);
    }

    // Delete the wireframe
    await wireframe.destroy();

    res.status(200).json({
      success: true,
      message: 'Wireframe deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting wireframe:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete wireframe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get wireframe statistics for dashboard
exports.getWireframeStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await Wireframe.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { projectId },
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
    console.error('Error fetching wireframe stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wireframe statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
