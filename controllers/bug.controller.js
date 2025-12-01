const db = require('../models/sql');
const Bug = db.Bug;
const BugComment = db.BugComment;
const User = db.User;
const Project = db.Project;

// Create a new bug
exports.createBug = async (req, res) => {
  try {
    const { title, description, priority, severity, steps_to_reproduce, expected_result, actual_result, project_id, assigned_to } = req.body;
    
    const bug = await Bug.create({
      title,
      description,
      priority,
      severity,
      steps_to_reproduce,
      expected_result,
      actual_result,
      project_id: project_id || null,
      reported_by: req.user.id,
      assigned_to: assigned_to || null,
      status: 'open'
    });

    // Include related data in the response
    const newBug = await Bug.findByPk(bug.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { 
          model: User, 
          as: 'assignee', 
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: newBug
    });
  } catch (error) {
    console.error('Error creating bug:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bug',
      error: error.message
    });
  }
};

// Get all bugs with filters
exports.getBugs = async (req, res) => {
  try {
    const { status, priority, project_id, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (status && status !== 'all') whereClause.status = status;
    if (priority && priority !== 'all') whereClause.priority = priority;
    if (project_id) whereClause.project_id = project_id;
    
    const { count, rows: bugs } = await Bug.findAndCountAll({
      where: whereClause,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'reporter', attributes: ['id', 'name'] },
        { 
          model: User, 
          as: 'assignee', 
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Apply search filter if provided
    let filteredBugs = bugs;
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredBugs = bugs.filter(bug => 
        bug.title.toLowerCase().includes(searchTerm) || 
        (bug.description && bug.description.toLowerCase().includes(searchTerm))
      );
    }

    res.status(200).json({
      success: true,
      data: filteredBugs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bugs',
      error: error.message
    });
  }
};

// Get a single bug by ID
exports.getBugById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bug = await Bug.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { 
          model: User, 
          as: 'assignee', 
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: BugComment,
          as: 'comments',
          include: [
            { 
              model: User, 
              as: 'author', 
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bug
    });
  } catch (error) {
    console.error('Error fetching bug:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bug',
      error: error.message
    });
  }
};

// Update a bug
exports.updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const bug = await Bug.findByPk(id);
    
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['title', 'description', 'status', 'priority', 'severity', 'steps_to_reproduce', 'expected_result', 'actual_result', 'assigned_to', 'project_id'];
    
    // Filter out any fields that aren't in the allowed list
    const updates = Object.keys(updateData)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    await bug.update(updates);
    
    // Fetch the updated bug with all relationships
    const updatedBug = await Bug.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { 
          model: User, 
          as: 'assignee', 
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedBug
    });
  } catch (error) {
    console.error('Error updating bug:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bug',
      error: error.message
    });
  }
};

// Delete a bug
exports.deleteBug = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bug = await Bug.findByPk(id);
    
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    await bug.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Bug deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bug:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bug',
      error: error.message
    });
  }
};

// Add a comment to a bug
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    const bug = await Bug.findByPk(id);
    
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    const newComment = await BugComment.create({
      comment,
      bug_id: id,
      user_id: req.user.id
    });
    
    // Fetch the comment with author details
    const commentWithAuthor = await BugComment.findByPk(newComment.id, {
      include: [
        { 
          model: User, 
          as: 'author', 
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: commentWithAuthor
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Get bug statistics
exports.getBugStats = async (req, res) => {
  try {
    const stats = await Bug.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const priorityStats = await Bug.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching bug statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bug statistics',
      error: error.message
    });
  }
};
