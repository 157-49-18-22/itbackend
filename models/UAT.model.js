module.exports = (sequelize, DataTypes) => {
  const UAT = sequelize.define('UAT', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    steps: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    tester: {
      type: DataTypes.STRING,
      allowNull: true
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    timestamps: true,
    tableName: 'UATs'
  });

  // Define associations
  UAT.associate = function(models) {
    UAT.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
    
    UAT.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    UAT.hasMany(models.Comment, {
      foreignKey: 'entityId',
      constraints: false,
      scope: {
        entityType: 'UAT'
      },
      as: 'comments'
    });
  };

  return UAT;
};
