const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Bug = sequelize.define('Bug', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed', 'reopened'),
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  steps_to_reproduce: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expected_result: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actual_result: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bugs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Bug.associate = (models) => {
  Bug.belongsTo(models.Project, {
    foreignKey: 'project_id',
    as: 'bugProject'
  });
  
  Bug.belongsTo(models.User, {
    foreignKey: 'reported_by',
    as: 'reporter'
  });
  
  Bug.belongsTo(models.User, {
    foreignKey: 'assigned_to',
    as: 'assignee'
  });
  
  Bug.hasMany(models.BugComment, {
    foreignKey: 'bug_id',
    as: 'comments'
  });
};

module.exports = Bug;
