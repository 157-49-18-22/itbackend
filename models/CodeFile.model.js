module.exports = (sequelize, DataTypes) => {
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
      allowNull: false,
      defaultValue: ''
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
      allowNull: false,
      defaultValue: '/'
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projects', // This should match the table name of the Project model
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
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'code_files',
    paranoid: true, // Enable soft deletes
    timestamps: true,
    underscored: true
  });

  CodeFile.associate = function(models) {
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

  return CodeFile;
};
