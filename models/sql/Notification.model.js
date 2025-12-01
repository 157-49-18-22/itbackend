const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  notificationId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Approval', 'Message', 'Mention', 'System', 'Alert', 'Task', 'Project'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  relatedProjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  relatedTaskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  relatedApprovalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'approvals',
      key: 'id'
    }
  },
  actionUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  hooks: {
    beforeCreate: async (notification) => {
      if (!notification.notificationId) {
        const count = await Notification.count();
        notification.notificationId = `N-${3000 + count + 1}`;
      }
    }
  },
  indexes: [
    { fields: ['recipientId'] },
    { fields: ['isRead'] },
    { fields: ['type'] }
  ]
});

module.exports = Notification;
