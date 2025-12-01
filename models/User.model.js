const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    joinDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeCreate: (user) => {
        // Generate avatar if not provided
        if (!user.avatar) {
          user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}&background=random`;
        }
      }
    }
  });

  // Instance method to check password (plain text comparison)
  User.prototype.validPassword = async function(password) {
    if (!this.password) return false;
    return password === this.password;
  };

  // Class methods
  User.associate = function(models) {
    User.hasMany(models.Project, { foreignKey: 'managerId', as: 'managedProjects' });
    User.belongsToMany(models.Project, { through: 'ProjectMembers', as: 'projects' });
    User.hasMany(models.Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
    User.hasMany(models.Comment, { foreignKey: 'userId' });
    User.hasMany(models.TimeEntry, { foreignKey: 'userId' });
  };

  return User;
};