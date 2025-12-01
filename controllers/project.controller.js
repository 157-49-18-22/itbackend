const { Project, Task, User, Client } = require('../models/sql');
const { Op } = require('sequelize');
const { logActivity } = require('../utils/activity.utils');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getAllProjects = async (req, res) => {
  try {
    const { status, priority, currentPhase, search } = req.query;
    
    let where = { isArchived: false };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (currentPhase) where.currentPhase = currentPhase;
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'company', 'email']
        },
        {
          model: User,
          as: 'projectManager',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status', 'priority']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'company', 'email', 'phone', 'address']
        },
        {
          model: User,
          as: 'projectManager',
          attributes: ['id', 'name', 'email', 'avatar', 'role']
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              as: 'assignedTo',
              attributes: ['id', 'name', 'email', 'avatar']
            }
          ]
        },
        {
          model: User,
          as: 'teamMembers',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email', 'avatar', 'role']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin, Project Manager)
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      clientId,
      status = 'Planning',
      priority = 'Medium',
      currentPhase = 'Planning',
      startDate,
      endDate,
      budget,
      projectManagerId,
      teamMemberIds = []
    } = req.body;

    // Validate required fields
    if (!name || !description || !clientId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, clientId, startDate, and endDate are required'
      });
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      clientId,
      status,
      priority,
      currentPhase,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget || { estimated: 0, actual: 0, currency: 'USD' },
      projectManagerId,
      progress: 0,
      phases: {
        uiux: { status: 'Not Started', progress: 0 },
        development: { status: 'Not Started', progress: 0 },
        testing: { status: 'Not Started', progress: 0 }
      },
      teamMembers: teamMemberIds,
      tags: [],
      attachments: [],
      repository: {},
      isArchived: false
    });

    // Associate team members if any
    if (teamMemberIds.length > 0) {
      await project.setTeamMembers(teamMemberIds);
    }

    // Log activity
    await logActivity({
      userId: req.user.id,
      projectId: project.id,
      type: 'project_created',
      description: `Project "${project.name}" was created`
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Project Manager)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has permission to update
    if (req.user.role !== 'admin' && req.user.id !== project.projectManagerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const updates = { ...req.body };
    
    // Convert date strings to Date objects if present
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    
    // Update project
    await project.update(updates);
    
    // Update team members if provided
    if (req.body.teamMemberIds) {
      await project.setTeamMembers(req.body.teamMemberIds);
    }

    // Log activity
    await logActivity({
      userId: req.user.id,
      projectId: project.id,
      type: 'project_updated',
      description: `Project "${project.name}" was updated`
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has permission to delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Log activity before deletion
    await logActivity({
      userId: req.user.id,
      projectId: project.id,
      type: 'project_deleted',
      description: `Project "${project.name}" was deleted`
    });

    // Soft delete the project
    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
exports.getProjectStats = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status', 'priority', 'dueDate', 'completedAt']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const tasks = project.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter(task => 
      ['In Progress', 'In Review', 'Testing'].includes(task.status)
    ).length;
    
    // Calculate completion percentage
    const completionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Count tasks by status
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    // Count tasks by priority
    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    // Calculate days remaining
    const today = new Date();
    const endDate = new Date(project.endDate);
    const timeDiff = endDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        status: project.status,
        currentPhase: project.currentPhase,
        progress: project.progress,
        completionPercentage,
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          byStatus: tasksByStatus,
          byPriority: tasksByPriority
        },
        timeline: {
          startDate: project.startDate,
          endDate: project.endDate,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          isOverdue: daysRemaining < 0
        },
        lastUpdated: project.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting project stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
