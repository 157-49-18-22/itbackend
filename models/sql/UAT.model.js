const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UAT = sequelize.define('UAT', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'passed', 'failed', 'blocked'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  tester: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'uats',
  timestamps: true
});

// Define associations
UAT.associate = (models) => {
  UAT.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  UAT.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project'
  });
};

module.exports = UAT;
