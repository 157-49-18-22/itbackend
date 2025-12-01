const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const db = require('../models/sql');
const { Op } = require('sequelize');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, type, project, search, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = req.query;
    
    // Build where clause
    const whereClause = {};
    if (status && status !== 'All') whereClause.status = status;
    if (type && type !== 'All') whereClause.type = type;
    if (project) whereClause.projectId = project;
    
    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { '$requestedBy.name$': { [Op.like]: `%${search}%` } },
        { '$requestedTo.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    
    const { count, rows: approvals } = await db.Approval.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: db.Project, 
          as: 'project', 
          attributes: ['id', 'name'] 
        },
        { 
          model: db.User, 
          as: 'requestedBy', 
          attributes: ['id', 'name', 'email', 'avatar'] 
        },
        { 
          model: db.User, 
          as: 'requestedTo', 
          attributes: ['id', 'name', 'email'] 
        }
      ],
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    res.json({ 
      success: true, 
      data: approvals,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const approval = await db.Approval.create({ 
      ...req.body, 
      requestedById: req.user.id,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Fetch the created approval with associations
    const createdApproval = await db.Approval.findByPk(approval.id, {
      include: [
        { model: db.Project, as: 'project', attributes: ['id', 'name'] },
        { model: db.User, as: 'requestedBy', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: db.User, as: 'requestedTo', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.status(201).json({ success: true, data: createdApproval });
  } catch (error) {
    console.error('Error creating approval:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      errors: error.errors ? error.errors.map(e => e.message) : []
    });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const approval = await Approval.update(
      { status: 'Approved', approvedAt: new Date() },
      {
        where: { id: req.params.id },
        returning: true,
        plain: true
      }
    );
    res.json({ success: true, data: approval[1].dataValues });
  } catch (error) {
    console.error('Error approving:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const approval = await Approval.update(
      { status: 'Rejected', rejectedAt: new Date(), rejectionReason: reason },
      {
        where: { id: req.params.id },
        returning: true,
        plain: true
      }
    );
    res.json({ success: true, data: approval[1].dataValues });
  } catch (error) {
    console.error('Error rejecting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
