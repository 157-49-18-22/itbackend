const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activityId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Approval', 'Task', 'Commit', 'Comment', 'Testing', 'Alert', 'Project', 'Deployment', 'File Upload'),
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectId: {
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
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activities',
  timestamps: true,
  hooks: {
    beforeCreate: async (activity) => {
      if (!activity.activityId) {
        const count = await Activity.count();
        activity.activityId = `A-${2000 + count + 1}`;
      }
    }
  },
  indexes: [
    { fields: ['projectId'] },
    { fields: ['userId'] },
    { fields: ['type'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = Activity;
