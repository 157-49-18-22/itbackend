const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Deployment = sequelize.define('Deployment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true, // Made optional
    references: {
      model: 'Projects',
      key: 'id',
    },
  },
  environment: {
    type: DataTypes.ENUM('development', 'staging', 'production'),
    allowNull: false,
    defaultValue: 'development',
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  commitHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  commitMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'success', 'failed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  },
  // logs field removed to match database schema
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deployedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  // Timestamps are automatically added by Sequelize
}, {
  tableName: 'deployments',
  timestamps: true, // Adds createdAt and updatedAt
  paranoid: true,  // Adds deletedAt for soft deletes
  indexes: [
    {
      fields: ['projectId'],
    },
    {
      fields: ['environment'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['deployedBy'],
    },
  ],
});

// Associations will be set up in the models/index.js file

module.exports = Deployment;
