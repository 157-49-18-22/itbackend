const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const TestResult = sequelize.define('TestResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('passed', 'failed', 'blocked'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  testCaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'test_case_id',
    references: {
      model: 'test_cases', // This should match the table name of TestCase model
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  executedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'executed_by',
    references: {
      model: 'users', // This should match your users table name
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'test_results',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
TestResult.associate = (models) => {
  TestResult.belongsTo(models.TestCase, {
    foreignKey: 'testCaseId',
    as: 'testCase'
  });
  
  TestResult.belongsTo(models.User, {
    foreignKey: 'executedBy',
    as: 'executor'
  });
};

module.exports = TestResult;
