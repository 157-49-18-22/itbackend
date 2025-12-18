const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Task = sequelize.define('Task', {
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
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,  // This field is optional
    defaultValue: null,
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'in_review', 'done'),
    defaultValue: 'todo'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  type: {
    type: DataTypes.ENUM('task', 'bug', 'story', 'epic', 'test'),
    defaultValue: 'task'
  },
  storyPoints: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  actualHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  comments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  checklist: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  dependencies: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  phase: {
    type: DataTypes.ENUM('UI/UX', 'Development', 'Testing'),
    defaultValue: 'Development'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['assigneeId'] },
    { fields: ['status'] },
    { fields: ['dueDate'] }
  ]
});

// Define associations
Task.associate = (models) => {
  Task.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project'
  });

  Task.belongsTo(models.User, {
    foreignKey: 'assigneeId',
    as: 'assignee'
  });

  Task.belongsTo(models.User, {
    foreignKey: 'reporterId',
    as: 'reporter'
  });
};

module.exports = Task;
