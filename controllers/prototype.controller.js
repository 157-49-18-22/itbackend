const { Prototype, Project, User, sequelize } = require('../models/sql');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/prototypes');
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
    return `/uploads/prototypes/${fileName}`;
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

// Create a new prototype
const createPrototype = async (req, res) => {
  try {
    const { title, description, version, status, category, projectId, link } = req.body;
    const userId = req.user.id; // Assuming user is authenticated and user ID is in req.user

    if (!req.file && !link) {
      return res.status(400).json({ error: 'Either an image file or a link is required' });
    }

    let imageUrl = null;
    if (req.file) {
      // Save file to local storage if uploaded
      imageUrl = saveFile(req.file);
    }

    const prototype = await Prototype.create({
      title,
      description,
      imageUrl,
      link: link || null,
      version: version || '1.0',
      status: status || 'draft',
      category: category || 'web',
      projectId,
      createdBy: userId,
      updatedBy: userId,
    });

    // Populate related data for response
    const newPrototype = await Prototype.findByPk(prototype.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json({
      success: true,
      data: newPrototype,
    });
  } catch (error) {
    console.error('Error creating prototype:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create prototype',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all prototypes with optional filtering
const getPrototypes = async (req, res) => {
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
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
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

    const prototypes = await Prototype.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: prototypes.length,
      data: prototypes,
    });
  } catch (error) {
    console.error('Error fetching prototypes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prototypes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get a single prototype by ID
const getPrototypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const prototype = await Prototype.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'updater', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!prototype) {
      return res.status(404).json({
        success: false,
        error: 'Prototype not found',
      });
    }

    res.status(200).json({
      success: true,
      data: prototype,
    });
  } catch (error) {
    console.error('Error fetching prototype:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prototype',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update a prototype
const updatePrototype = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, version, status, category, link } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    const prototype = await Prototype.findByPk(id);
    if (!prototype) {
      return res.status(404).json({
        success: false,
        error: 'Prototype not found',
      });
    }

    let imageUrl = prototype.imageUrl;

    // Handle file upload if a new file is provided
    if (req.file) {
      // Delete old file if it exists
      if (prototype.imageUrl) {
        deleteFile(prototype.imageUrl);
      }
      // Save new file
      imageUrl = saveFile(req.file);
    }

    // Update prototype
    const updatedPrototype = await prototype.update({
      title: title || prototype.title,
      description: description !== undefined ? description : prototype.description,
      imageUrl,
      link: link !== undefined ? link : prototype.link,
      version: version || prototype.version,
      status: status || prototype.status,
      category: category || prototype.category,
      updatedBy: userId,
    }, {
      where: { id },
      returning: true,
    });

    // Fetch the updated prototype with related data
    const result = await Prototype.findByPk(updatedPrototype.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'updater', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error updating prototype:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update prototype',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete a prototype
const deletePrototype = async (req, res) => {
  try {
    const { id } = req.params;

    const prototype = await Prototype.findByPk(id);
    if (!prototype) {
      return res.status(404).json({
        success: false,
        error: 'Prototype not found',
      });
    }

    // Delete associated file if it exists
    if (prototype.imageUrl) {
      deleteFile(prototype.imageUrl);
    }

    await prototype.destroy();

    res.status(200).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting prototype:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete prototype',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get prototype statistics for dashboard
const getPrototypeStats = async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {};

    if (projectId) {
      where.projectId = projectId;
    }

    const total = await Prototype.count({ where });
    const byStatus = await Prototype.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where,
      group: ['status'],
      raw: true,
    });

    const byCategory = await Prototype.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where,
      group: ['category'],
      raw: true,
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus,
        byCategory,
      },
    });
  } catch (error) {
    console.error('Error fetching prototype stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prototype statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createPrototype,
  getPrototypes,
  getPrototypeById,
  updatePrototype,
  deletePrototype,
  getPrototypeStats,
};
