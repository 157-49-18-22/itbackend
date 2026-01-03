const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
// Use centralized models to ensure associations work
const { Client, Project, Deliverable, Approval, Activity, User } = require('../models/sql');

// Get client dashboard data
exports.getClientDashboard = async (req, res) => {
  try {
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'user';
    const userEmail = req.user.email;
    const { projectId } = req.query;

    let project = null;

    if (projectId) {
      // Logic for specific project requested via dropdown
      if (['admin', 'project_manager', 'developer', 'tester', 'ui/ux', 'designer'].includes(userRole)) {
        project = await Project.findByPk(projectId, {
          include: [{ model: Client, as: 'client' }]
        });
      } else {
        const client = await Client.findOne({ where: { email: userEmail } });
        if (client) {
          project = await Project.findOne({
            where: { id: projectId, clientId: client.id }
          });
        }
      }
    }

    // Default logic if no projectId or specific project not found
    if (!project) {
      if (['admin', 'project_manager', 'developer', 'tester', 'ui/ux', 'designer'].includes(userRole)) {
        project = await Project.findOne({
          where: {
            status: { [Op.notIn]: ['Cancelled', 'Archived'] }
          },
          order: [['updatedAt', 'DESC']],
          include: [{ model: Client, as: 'client' }]
        });
      } else {
        const client = await Client.findOne({ where: { email: userEmail } });

        if (!client) {
          return res.status(404).json({
            success: false,
            message: 'Client profile not found. Please ensure your account email matches a registered client.'
          });
        }

        project = await Project.findOne({
          where: {
            clientId: client.id,
            status: { [Op.notIn]: ['Cancelled', 'Archived'] }
          },
          order: [['createdAt', 'DESC']]
        });
      }
    }

    if (!project) {
      return res.json({
        success: true,
        data: {
          projectName: 'No Active Project',
          currentStage: 'N/A',
          overallProgress: 0,
          stages: {
            uiux: { progress: 0, status: 'Not Started' },
            development: { progress: 0, status: 'Not Started' },
            testing: { progress: 0, status: 'Not Started' }
          },
          quickStats: {
            totalDeliverables: 0,
            pendingApprovals: 0,
            completedMilestones: 0,
            totalMilestones: 0
          },
          recentActivity: [],
          nextMilestone: { name: 'N/A', date: null, daysRemaining: 0 }
        }
      });
    }

    // Get stats
    const totalDeliverables = await Deliverable.count({ where: { projectId: project.id } });
    const pendingApprovals = await Approval.count({ where: { projectId: project.id, status: 'Pending' } });

    // Milestones (using phases as rough proxy)
    let completedMilestones = 0;
    const totalMilestones = 3; // UI/UX, Dev, Testing
    if (project.phases?.uiux?.status === 'Completed') completedMilestones++;
    if (project.phases?.development?.status === 'Completed') completedMilestones++;
    if (project.phases?.testing?.status === 'Completed') completedMilestones++;

    // Recent Activity
    let activities = [];
    try {
      /*
      activities = await Activity.findAll({
        where: { projectId: project.id },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{
          model: User,
          as: 'user',
          attributes: ['name', 'avatar']
        }]
      });
      */
    } catch (e) {
      console.warn("Activities not found:", e.message);
    }

    const formattedActivities = activities.map(act => {
      // Calculate relative time or pass ISO string
      return {
        id: act.id,
        type: act.type || 'update',
        message: act.description || act.action,
        time: act.createdAt,
        icon: 'FaClock', // Frontend can map this
        user: act.user
      };
    });

    // Calculate Next Milestone
    let nextMilestone = { name: 'Project Completion', date: project.endDate, daysRemaining: 0 };
    if (project.phases?.uiux?.status !== 'Completed' && project.phases?.uiux?.status !== 'completed') {
      nextMilestone = { name: 'UI/UX Signoff', date: project.endDate, daysRemaining: 0 };
    } else if (project.phases?.development?.status !== 'Completed' && project.phases?.development?.status !== 'completed') {
      nextMilestone = { name: 'Development Completion', date: project.endDate, daysRemaining: 0 };
    } else if (project.phases?.testing?.status !== 'Completed' && project.phases?.testing?.status !== 'completed') {
      nextMilestone = { name: 'Testing Completion', date: project.endDate, daysRemaining: 0 };
    }

    // Calculate days remaining
    if (nextMilestone.date) {
      const today = new Date();
      const due = new Date(nextMilestone.date);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nextMilestone.daysRemaining = diffDays > 0 ? diffDays : 0;
    }

    res.json({
      success: true,
      data: {
        projectName: project.name,
        currentStage: project.currentPhase,
        overallProgress: project.progress,
        stages: project.phases || {
          uiux: { progress: 0, status: 'Not Started' },
          development: { progress: 0, status: 'Not Started' },
          testing: { progress: 0, status: 'Not Started' }
        },
        quickStats: {
          totalDeliverables,
          pendingApprovals,
          completedMilestones,
          totalMilestones
        },
        recentActivity: formattedActivities,
        nextMilestone
      }
    });

  } catch (error) {
    console.error('Error in getClientDashboard:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get all clients with pagination and filtering
exports.getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};

    // Status filter
    if (status && ['Active', 'Inactive', 'Prospect'].includes(status)) {
      whereClause.status = status;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { contact: { [Op.like]: `%${search}%` } }
      ];
    }

    // Sorting options
    let order = [['createdAt', 'DESC']];
    if (sortBy === 'name-asc') {
      order = [['name', 'ASC']];
    } else if (sortBy === 'name-desc') {
      order = [['name', 'DESC']];
    } else if (sortBy === 'oldest') {
      order = [['createdAt', 'ASC']];
    }

    const { count, rows: clients } = await Client.findAndCountAll({
      where: whereClause,
      order,
      limit: parseInt(limit),
      offset: offset,
      raw: true
    });

    // Add a default logo if not present
    const clientsWithLogo = clients.map(client => ({
      ...client,
      logo: client.logo || '🏢' // Default emoji logo
    }));

    res.json({
      success: true,
      data: clientsWithLogo,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Add default logo if not present
    const clientData = client.get({ plain: true });
    clientData.logo = clientData.logo || '🏢';

    res.json({
      success: true,
      data: clientData
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new client
exports.createClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const transaction = await Client.sequelize.transaction();

  try {
    const { name, contact, email, phone, company, status = 'Active', address } = req.body;

    // Check if client with email already exists
    const existingClient = await Client.findOne({
      where: {
        [Op.or]: [
          { email },
          { name }
        ]
      },
      transaction
    });

    if (existingClient) {
      await transaction.rollback();
      const field = existingClient.email === email ? 'email' : 'company name';
      return res.status(400).json({
        success: false,
        message: `A client with this ${field} already exists`
      });
    }

    // Create new client
    const client = await Client.create({
      name: name.trim(),
      contact: contact.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      company: company ? company.trim() : null,
      status: ['Active', 'Inactive', 'Prospect'].includes(status) ? status : 'Active',
      address: address ? address.trim() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { transaction });

    await transaction.commit();

    // Get the created client with default logo
    const clientData = client.get({ plain: true });
    clientData.logo = clientData.logo || '🏢';

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: clientData
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update an existing client
exports.updateClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const transaction = await Client.sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, contact, email, phone, company, status, address } = req.body;

    // Find the existing client
    const existingClient = await Client.findByPk(id, { transaction });

    if (!existingClient) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if email or name is being updated to an existing one
    if (email || name) {
      const whereClause = {
        id: { [Op.ne]: id },
        [Op.or]: []
      };

      if (email) whereClause[Op.or].push({ email });
      if (name) whereClause[Op.or].push({ name });

      const duplicateClient = await Client.findOne({
        where: whereClause,
        transaction
      });

      if (duplicateClient) {
        await transaction.rollback();
        const field = duplicateClient.email === email ? 'email' : 'company name';
        return res.status(400).json({
          success: false,
          message: `A client with this ${field} already exists`
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(contact && { contact: contact.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      ...(company !== undefined && { company: company ? company.trim() : null }),
      ...(status && { status: ['Active', 'Inactive', 'Prospect'].includes(status) ? status : existingClient.status }),
      ...(address !== undefined && { address: address ? address.trim() : null }),
      updatedAt: new Date()
    };

    // Update client
    await Client.update(updateData, {
      where: { id },
      transaction
    });

    await transaction.commit();

    // Get the updated client
    const updatedClient = await Client.findByPk(id);
    const clientData = updatedClient.get({ plain: true });
    clientData.logo = clientData.logo || '🏢';

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: clientData
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  const transaction = await Client.sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if client exists
    const client = await Client.findByPk(id, { transaction });

    if (!client) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Delete the client
    await Client.destroy({
      where: { id },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search clients
exports.searchClients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = `%${query}%`;

    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchQuery } },
          { email: { [Op.like]: searchQuery } },
          { company: { [Op.like]: searchQuery } },
          { contact: { [Op.like]: searchQuery } },
          { phone: { [Op.like]: searchQuery } }
        ]
      },
      limit: 10,
      raw: true
    });

    // Add default logo if not present
    const clientsWithLogo = clients.map(client => ({
      ...client,
      logo: client.logo || '🏢'
    }));

    res.json({
      success: true,
      data: clientsWithLogo
    });

  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update an existing client
exports.updateClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const transaction = await Client.sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, contact, email, phone, company, status, address } = req.body;

    // Find the existing client
    const existingClient = await Client.findByPk(id, { transaction });

    if (!existingClient) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if email or name is being updated to an existing one
    if (email || name) {
      const whereClause = {
        id: { [Op.ne]: id },
        [Op.or]: []
      };

      if (email) whereClause[Op.or].push({ email });
      if (name) whereClause[Op.or].push({ name });

      const duplicateClient = await Client.findOne({
        where: whereClause,
        transaction
      });

      if (duplicateClient) {
        await transaction.rollback();
        const field = duplicateClient.email === email ? 'email' : 'company name';
        return res.status(400).json({
          success: false,
          message: `A client with this ${field} already exists`
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(contact && { contact: contact.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      ...(company !== undefined && { company: company ? company.trim() : null }),
      ...(status && { status: ['Active', 'Inactive', 'Prospect'].includes(status) ? status : existingClient.status }),
      ...(address !== undefined && { address: address ? address.trim() : null }),
      updatedAt: new Date()
    };

    // Update client
    await Client.update(updateData, {
      where: { id },
      transaction
    });

    await transaction.commit();

    // Get the updated client
    const updatedClient = await Client.findByPk(id);
    const clientData = updatedClient.get({ plain: true });
    clientData.logo = clientData.logo || '🏢';

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: clientData
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  const transaction = await Client.sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if client exists
    const client = await Client.findByPk(id, { transaction });

    if (!client) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Delete the client
    await Client.destroy({
      where: { id },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search clients
exports.searchClients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = `%${query}%`;

    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchQuery } },
          { email: { [Op.like]: searchQuery } },
          { company: { [Op.like]: searchQuery } },
          { contact: { [Op.like]: searchQuery } },
          { phone: { [Op.like]: searchQuery } }
        ]
      },
      limit: 10,
      raw: true
    });

    // Add default logo if not present
    const clientsWithLogo = clients.map(client => ({
      ...client,
      logo: client.logo || '🏢'
    }));

    res.json({
      success: true,
      data: clientsWithLogo
    });

  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching clients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  const { name, contact, email, phone, company, status, address } = req.body;

};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, { raw: true });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Add default logo
    client.logo = client.logo || '🏢';

    res.json({
      success: true,
      data: client
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
