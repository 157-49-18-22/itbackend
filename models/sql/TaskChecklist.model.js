const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const TaskChecklist = sequelize.define('TaskChecklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  item: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  orderNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  }
}, {
  tableName: 'task_checklists',
  timestamps: true,
  indexes: [
    { fields: ['taskId'] },
    { fields: ['isCompleted'] }
  ]
});

module.exports = TaskChecklist;
