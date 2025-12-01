const { AuditLog } = require('../models/sql');

/**
 * Creates an audit log entry for an action
 * @param {Object} params - The audit log parameters
 * @param {string} params.action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} params.entity - The entity type (e.g., 'WorkflowState', 'Project')
 * @param {number} params.entityId - The ID of the entity being acted upon
 * @param {number} params.performedBy - The ID of the user who performed the action
 * @param {Object} params.oldValue - The previous state of the entity
 * @param {Object} params.newValue - The new state of the entity
 * @param {string} params.description - Description of the action
 * @param {string} params.ipAddress - IP address of the user
 * @param {string} params.userAgent - User agent string
 * @returns {Promise<Object>} The created audit log entry
 */
const createAuditLog = async ({
  action,
  entityType,
  entityId,
  userId,
  oldValue = null,
  newValue = null,
  description = '',
  ipAddress = null,
  userAgent = null
}) => {
  try {
    // Create the audit log entry
    const auditLog = await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      description,
      ipAddress,
      userAgent
    });

    // Return the plain object to avoid Sequelize instance issues
    return auditLog.get({ plain: true });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw the error to prevent blocking the main operation
    return null;
  }
};

/**
 * Retrieves audit logs for a specific entity
 * @param {string} entityType - The entity type
 * @param {number} entityId - The ID of the entity
 * @param {Object} options - Additional options
 * @param {number} [options.limit=50] - Maximum number of logs to return
 * @param {number} [options.offset=0] - Number of logs to skip for pagination
 * @returns {Promise<Array>} Array of audit logs
 */
const getAuditLogs = async (entityType, entityId, { limit = 50, offset = 0 } = {}) => {
  try {
    const logs = await AuditLog.findAll({
      where: { entityType, entityId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      raw: true
    });

    // Parse the JSON strings back to objects
    return logs.map(log => ({
      ...log,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null
    }));
  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs
};
