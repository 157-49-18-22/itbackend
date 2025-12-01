const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Wireframe = sequelize.define('Wireframe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,  // Make image optional
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0',
  },
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'in_review', 'approved'),
    defaultValue: 'draft',
  },
  category: {
    type: DataTypes.ENUM('web', 'mobile', 'tablet', 'desktop'),
    defaultValue: 'web',
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  paranoid: true, // Enable soft delete
});

// Add associations
Wireframe.associate = (models) => {
  Wireframe.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project',
  });
  
  Wireframe.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
  
  Wireframe.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });
};

module.exports = Wireframe;
