const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const Client = require('../models/Client');

/**
 * Get all clients with pagination and filtering
 * @route GET /api/clients
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Items per page
 * @param {string} [status] - Filter by status (Active, Inactive, Prospect)
 * @param {string} [search] - Search term for client name, email, company, or contact
 * @param {string} [sortBy=newest] - Sort by (newest, oldest, name-asc, name-desc)
 */
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

/**
 * Get single client by ID
 * @route GET /api/clients/:id
 * @param {string} id - Client ID
 */
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

/**
 * Create a new client
 * @route POST /api/clients
 * @param {string} name - Company name (required)
 * @param {string} contact - Contact person (required)
 * @param {string} email - Email address (required, unique)
 * @param {string} [phone] - Phone number
 * @param {string} [company] - Company name (if different from name)
 * @param {string} [status=Active] - Client status (Active, Inactive, Prospect)
 * @param {string} [address] - Company address
 */
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
    
    // Check if client with email or name already exists
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

/**
 * Update an existing client
 * @route PUT /api/clients/:id
 * @param {string} id - Client ID
 * @param {string} [name] - Company name
 * @param {string} [contact] - Contact person
 * @param {string} [email] - Email address
 * @param {string} [phone] - Phone number
 * @param {string} [company] - Company name
 * @param {string} [status] - Client status (Active, Inactive, Prospect)
 * @param {string} [address] - Company address
 */
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

/**
 * Delete a client
 * @route DELETE /api/clients/:id
 * @param {string} id - Client ID
 */
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

/**
 * Search clients
 * @route GET /api/clients/search
 * @param {string} query - Search query (min 2 characters)
 */
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
