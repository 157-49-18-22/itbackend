const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Prototype = sequelize.define('Prototype', {
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
    allowNull: true,
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
  link: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Must be a valid URL',
      },
    },
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
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['deletedAt'] },
  },
});

// Add associations
Prototype.associate = (models) => {
  Prototype.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project',
  });
  
  Prototype.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
  
  Prototype.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });
  
  // Add hook to update updatedAt when prototype is updated
  Prototype.addHook('beforeUpdate', async (prototype) => {
    prototype.updatedAt = new Date();
  });
};

module.exports = Prototype;
