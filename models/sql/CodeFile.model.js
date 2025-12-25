const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const CodeFile = sequelize.define('CodeFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'javascript',
    validate: {
      isIn: [['javascript', 'typescript', 'css', 'html', 'json', 'python', 'java']]
    }
  },
  path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['deletedAt'] }
  },
  scopes: {
    withTrashed: {
      paranoid: false
    }
  },
  tableName: 'codefiles',
  timestamps: true,
  paranoid: true,
  underscored: false,
  freezeTableName: true
});

// Add associations
CodeFile.associate = (models) => {
  CodeFile.belongsTo(models.Project, {
    foreignKey: 'projectId',
    as: 'project'
  });

  CodeFile.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  CodeFile.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });
};

module.exports = CodeFile;
