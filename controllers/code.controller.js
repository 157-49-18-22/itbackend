const { CodeFile, User } = require('../models/sql');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

/**
 * Get all code files for a project
 */
exports.getProjectCodeFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { search, language } = req.query;
    
    const where = { projectId };
    
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    
    if (language) {
      where.language = language;
    }
    
    const codeFiles = await CodeFile.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'updater', attributes: ['id', 'name', 'email'] }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    res.json(codeFiles);
  } catch (error) {
    console.error('Error fetching code files:', error);
    res.status(500).json({ message: 'Error fetching code files', error: error.message });
  }
};

/**
 * Get a single code file by ID
 */
exports.getCodeFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const codeFile = await CodeFile.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'updater', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    if (!codeFile) {
      return res.status(404).json({ message: 'Code file not found' });
    }
    
    res.json(codeFile);
  } catch (error) {
    console.error('Error fetching code file:', error);
    res.status(500).json({ message: 'Error fetching code file', error: error.message });
  }
};

/**
 * Create a new code file
 */
exports.createCodeFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, content, language, path, projectId } = req.body;
    
    const codeFile = await CodeFile.create({
      name,
      content: content || '',
      language: language || 'javascript',
      path: path || '/',
      projectId,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    res.status(201).json(codeFile);
  } catch (error) {
    console.error('Error creating code file:', error);
    res.status(500).json({ message: 'Error creating code file', error: error.message });
  }
};

/**
 * Update a code file
 */
exports.updateCodeFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, language, path } = req.body;
    
    const codeFile = await CodeFile.findByPk(id);
    
    if (!codeFile) {
      return res.status(404).json({ message: 'Code file not found' });
    }
    
    // Check if user has permission to update
    if (codeFile.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this file' });
    }
    
    // Update fields if provided
    if (name !== undefined) codeFile.name = name;
    if (content !== undefined) codeFile.content = content;
    if (language !== undefined) codeFile.language = language;
    if (path !== undefined) codeFile.path = path;
    
    codeFile.updatedBy = req.user.id;
    
    await codeFile.save();
    
    res.json(codeFile);
  } catch (error) {
    console.error('Error updating code file:', error);
    res.status(500).json({ message: 'Error updating code file', error: error.message });
  }
};

/**
 * Delete a code file (soft delete)
 */
exports.deleteCodeFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const codeFile = await CodeFile.findByPk(id);
    
    if (!codeFile) {
      return res.status(404).json({ message: 'Code file not found' });
    }
    
    // Check if user has permission to delete
    if (codeFile.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }
    
    await codeFile.destroy();
    
    res.json({ message: 'Code file deleted successfully' });
  } catch (error) {
    console.error('Error deleting code file:', error);
    res.status(500).json({ message: 'Error deleting code file', error: error.message });
  }
};

/**
 * Search code files
 */
exports.searchCodeFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }
    
    const codeFiles = await CodeFile.findAll({
      where: {
        projectId,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { content: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        { model: req.db.User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 50
    });
    
    res.json(codeFiles);
  } catch (error) {
    console.error('Error searching code files:', error);
    res.status(500).json({ message: 'Error searching code files', error: error.message });
  }
};
