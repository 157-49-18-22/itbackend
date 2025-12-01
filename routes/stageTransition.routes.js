const express = require('express');
const router = express.Router();
const db = require('../config/database.sql');
const { protect } = require('../middleware/auth.middleware');
const { logAction } = require('../middleware/auditLogger.middleware');

// Get all stage transitions
router.get('/', protect, async (req, res) => {
  try {
    console.log('Fetching stage transitions...');
    
    const query = `
      SELECT 
        st.*,
        COALESCE(u.name, 'System') as requestedByName,
        COALESCE(u.email, 'system@example.com') as requestedByEmail,
        COALESCE(
          JSON_OBJECT(
            'id', u.id, 
            'name', u.name, 
            'email', u.email
          ),
          JSON_OBJECT(
            'id', 0,
            'name', 'System',
            'email', 'system@example.com'
          )
        ) as requestedBy
      FROM stage_transitions st
      LEFT JOIN users u ON st.requestedById = u.id
      ORDER BY st.transitionDate DESC
    `;
    
    console.log('Executing query:', query);
    const [transitions] = await db.sequelize.query(query);
    console.log('Query result:', transitions);
    
    res.status(200).json({
      success: true,
      data: transitions
    });
  } catch (error) {
    console.error('Error fetching stage transitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stage transitions',
      error: error.message
    });
  }
});

// Get stage transition by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT st.*, 
             JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email) as requestedBy
      FROM stage_transitions st
      JOIN users u ON st.requestedById = u.id
      WHERE st.id = ?
    `;
    
    const [transitions] = await db.sequelize.query(query, {
      replacements: [id]
    });
    
    if (transitions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stage transition not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transitions[0]
    });
  } catch (error) {
    console.error('Error fetching stage transition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stage transition',
      error: error.message
    });
  }
});

// Create a new stage transition
router.post('/', protect, logAction('create', 'stage_transition'), async (req, res) => {
  try {
    const { 
      projectId, projectName, fromStage, toStage, 
      requestedById, notes, transitionDate 
    } = req.body;
    
    if (!projectId || !fromStage || !toStage || !requestedById) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const query = `
      INSERT INTO stage_transitions 
        (projectId, projectName, fromStage, toStage, status, 
         requestedById, notes, transitionDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await db.sequelize.query(query, {
      replacements: [
        projectId, projectName, fromStage, toStage, 
        requestedById, notes, transitionDate || new Date()
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Stage transition created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating stage transition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create stage transition',
      error: error.message
    });
  }
});

// Approve a stage transition
router.post('/:id/approve', protect, logAction('approve', 'stage_transition'), async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedById } = req.body;
    
    if (!approvedById) {
      return res.status(400).json({
        success: false,
        message: 'Missing approvedById field'
      });
    }
    
    const query = `
      UPDATE stage_transitions
      SET status = 'Approved', 
          approvedById = ?,
          updatedAt = NOW()
      WHERE id = ? AND status = 'Pending'
    `;
    
    const [result] = await db.sequelize.query(query, {
      replacements: [approvedById, id]
    });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stage transition not found or already processed'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Stage transition approved successfully'
    });
  } catch (error) {
    console.error('Error approving stage transition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve stage transition',
      error: error.message
    });
  }
});

// Reject a stage transition
router.post('/:id/reject', protect, logAction('reject', 'stage_transition'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedById, rejectionReason } = req.body;
    
    if (!rejectedById || !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const query = `
      UPDATE stage_transitions
      SET status = 'Rejected', 
          rejectedById = ?,
          rejectionReason = ?,
          updatedAt = NOW()
      WHERE id = ? AND status = 'Pending'
    `;
    
    const [result] = await db.sequelize.query(query, {
      replacements: [rejectedById, rejectionReason, id]
    });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stage transition not found or already processed'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Stage transition rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting stage transition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject stage transition',
      error: error.message
    });
  }
});

// Get stage transitions by project ID
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    // Convert projectId to number to ensure type consistency with database
    const projectId = parseInt(req.params.projectId, 10);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format. Must be a number.'
      });
    }
    
    console.log('Fetching transitions for project ID:', projectId, 'Type:', typeof projectId);
    
    const query = `
      SELECT st.*, 
             JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email) as requestedBy
      FROM stage_transitions st
      JOIN users u ON st.requestedById = u.id
      WHERE st.projectId = ?
      ORDER BY st.transitionDate DESC
    `;
    
    console.log('Executing query with projectId:', projectId);
    const [transitions] = await db.sequelize.query(query, {
      replacements: [projectId]
    });
    
    console.log(`Found ${transitions.length} transitions for project ${projectId}`);
    
    res.status(200).json({
      success: true,
      data: transitions
    });
  } catch (error) {
    console.error('Error fetching project stage transitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project stage transitions',
      error: error.message
    });
  }
});

module.exports = router;
