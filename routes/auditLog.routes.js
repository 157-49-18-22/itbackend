const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const AuditLog = require('../models/sql/AuditLog.model');
const { User } = require('../models/sql');

router.use(protect);

// Get all audit logs (Admin only)
router.get('/', authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const { userId, action, entityType, startDate, endDate, limit = 100 } = req.query;
    
    let where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (startDate && endDate) {
      where.createdAt = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get audit logs for specific entity
router.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await AuditLog.findAll({
      where: { entityType, entityId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export audit logs (Admin only)
router.get('/export', authorize('Admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    // Convert to CSV format
    const csv = convertToCSV(logs);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function convertToCSV(logs) {
  const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Description'];
  const rows = logs.map(log => [
    log.createdAt,
    log.user?.name || 'Unknown',
    log.action,
    log.entityType,
    log.entityId || '',
    log.ipAddress || '',
    log.description || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

module.exports = router;
