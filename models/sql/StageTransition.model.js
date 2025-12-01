const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const StageTransition = sequelize.define('StageTransition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  fromStage: {
    type: DataTypes.ENUM('Planning', 'UI/UX Design', 'Development', 'Testing', 'Deployment'),
    allowNull: false
  },
  toStage: {
    type: DataTypes.ENUM('Planning', 'UI/UX Design', 'Development', 'Testing', 'Deployment', 'Completed'),
    allowNull: false
  },
  requestedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  checklist: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  transitionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'stage_transitions',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['status'] },
    { fields: ['fromStage'] },
    { fields: ['toStage'] }
  ]
});

module.exports = StageTransition;
