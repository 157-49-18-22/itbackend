const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const WorkflowState = sequelize.define('WorkflowState', {
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
  currentState: {
    type: DataTypes.ENUM(
      'RequirementGathering',
      'Wireframing',
      'Design',
      'Development',
      'Testing',
      'UAT',
      'Deployment',
      'Completed'
    ),
    defaultValue: 'RequirementGathering'
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'Blocked'),
    defaultValue: 'Not Started'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'workflow_states'
});

// Define associations
WorkflowState.associate = (models) => {
  WorkflowState.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project'
  });
};

module.exports = WorkflowState;
