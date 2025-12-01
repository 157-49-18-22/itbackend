const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const TimeTracking = sequelize.define('TimeTracking', {
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
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 0
  },
  isBillable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'time_tracking',
  timestamps: true,
  hooks: {
    beforeSave: (entry) => {
      if (entry.endTime && entry.startTime) {
        entry.duration = Math.round((new Date(entry.endTime) - new Date(entry.startTime)) / 60000);
      }
    }
  },
  indexes: [
    { fields: ['userId'] },
    { fields: ['projectId'] },
    { fields: ['taskId'] },
    { fields: ['startTime'] }
  ]
});

module.exports = TimeTracking;
