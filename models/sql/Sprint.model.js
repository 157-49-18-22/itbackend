const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Sprint = sequelize.define('Sprint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  goal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Planned', 'Active', 'Completed', 'Cancelled'),
    defaultValue: 'Planned'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completedPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  velocity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tasks: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  retrospective: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'sprints',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['status'] },
    { fields: ['startDate'] },
    { fields: ['endDate'] }
  ]
});

module.exports = Sprint;
