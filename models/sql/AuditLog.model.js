const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM(
      'CREATE', 'UPDATE', 'DELETE',
      'LOGIN', 'LOGOUT',
      'APPROVE', 'REJECT',
      'STAGE_TRANSITION',
      'FILE_UPLOAD', 'FILE_DELETE',
      'ASSIGN_TASK', 'COMPLETE_TASK'
    ),
    allowNull: false
  },
  entityType: {
    type: DataTypes.ENUM(
      'Project', 'Task', 'User', 'Client',
      'Approval', 'Deliverable', 'Message',
      'Notification', 'TimeTracking'
    ),
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  oldValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['action'] },
    { fields: ['entityType'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = AuditLog;
