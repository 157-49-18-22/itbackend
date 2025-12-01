const AuditLog = require('../models/sql/AuditLog.model');

// Middleware to log actions
const logAction = (action, entityType) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function
    res.send = function(data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || (req.body && req.body.id) || null;
        
        // Log the action asynchronously
        AuditLog.create({
          userId: req.user?.id,
          action,
          entityType,
          entityId,
          oldValue: req.auditOldValue || null,
          newValue: req.body || null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          description: `${action} ${entityType}${entityId ? ` #${entityId}` : ''}`
        }).catch(err => console.error('Audit log error:', err));
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

// Helper to capture old value before update
const captureOldValue = (Model) => {
  return async (req, res, next) => {
    if (req.params.id) {
      try {
        const record = await Model.findByPk(req.params.id);
        if (record) {
          req.auditOldValue = record.toJSON();
        }
      } catch (error) {
        console.error('Error capturing old value:', error);
      }
    }
    next();
  };
};

module.exports = { logAction, captureOldValue };
