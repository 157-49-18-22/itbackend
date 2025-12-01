const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Mockup = sequelize.define('Mockup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url'
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  },
  status: {
    type: DataTypes.ENUM('draft', 'in_review', 'approved', 'rejected'),
    defaultValue: 'draft'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Changed from false to true to make it optional
    field: 'project_id',
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'approved_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'mockups',
  timestamps: true,
  underscored: true,
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['deletedAt'] }
  },
  scopes: {
    withDeleted: {
      paranoid: false
    }
  }
});

// Define associations after the model is defined
Mockup.associate = function(models) {
  // Project association
  Mockup.belongsTo(models.Project, {
    foreignKey: 'project_id',
    as: 'project',
    onDelete: 'CASCADE'
  });
  
  // Creator association
  Mockup.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
    onDelete: 'SET NULL'
  });
  
  // Approver association
  Mockup.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
    onDelete: 'SET NULL'
  });
};

module.exports = Mockup;
