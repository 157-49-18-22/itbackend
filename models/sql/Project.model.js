const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'),
    defaultValue: 'Planning'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  currentPhase: {
    type: DataTypes.ENUM('Planning', 'UI/UX Design', 'Development', 'Testing', 'Deployment', 'Completed'),
    defaultValue: 'Planning'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actualEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  budget: {
    type: DataTypes.JSON,
    defaultValue: {
      estimated: 0,
      actual: 0,
      currency: 'USD'
    }
  },
  projectManagerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  teamMembers: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  phases: {
    type: DataTypes.JSON,
    defaultValue: {
      uiux: { status: 'Not Started', progress: 0 },
      development: { status: 'Not Started', progress: 0 },
      testing: { status: 'Not Started', progress: 0 }
    }
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  repository: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    { fields: ['clientId'] },
    { fields: ['status'] },
    { fields: ['projectManagerId'] }
  ]
});

// Define associations after the model is defined
Project.associate = function (models) {
  // Define the one-to-many relationship with Mockup
  Project.hasMany(models.Mockup, {
    foreignKey: 'projectId',
    as: 'mockups',
    onDelete: 'CASCADE'
  });

  // Define the one-to-many relationship with Task
  Project.hasMany(models.Task, {
    foreignKey: 'projectId',
    as: 'tasks',
    onDelete: 'SET NULL'
  });
};

module.exports = Project;
