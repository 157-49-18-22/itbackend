const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const TestCase = sequelize.define('TestCase', {
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
  type: {
    type: DataTypes.ENUM('functional', 'integration', 'regression', 'smoke', 'sanity', 'performance'),
    defaultValue: 'functional'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('not_run', 'passed', 'failed', 'blocked'),
    defaultValue: 'not_run'
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Stores array of {step: string, expected: string}'
  },
  expectedResult: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'expected_result'
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'project_id',
    references: {
      model: 'projects', // Make sure this matches your projects table name
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users', // Make sure this matches your users table name
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'assigned_to',
    references: {
      model: 'users', // Make sure this matches your users table name
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  lastRun: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_run'
  }
}, {
  tableName: 'test_cases',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
TestCase.associate = (models) => {
  TestCase.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project'
  });
  
  TestCase.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  TestCase.belongsTo(models.User, {
    foreignKey: 'assignedTo',
    as: 'assignee'
  });
  
  TestCase.hasMany(models.TestResult, {
    foreignKey: 'testCaseId',
    as: 'testResults'
  });
};

module.exports = TestCase;
