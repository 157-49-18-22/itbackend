const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Project Manager', 'Developer', 'Designer', 'Tester', 'Client'),
    defaultValue: 'Developer'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  department: {
    type: DataTypes.ENUM('Development', 'Design', 'Marketing', 'Sales', 'Support', 'Management'),
    defaultValue: 'Development'
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on-leave'),
    defaultValue: 'active'
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      emailNotifications: true,
      pushNotifications: true,
      theme: 'light'
    }
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  // No password hashing hooks
});

// Password comparison that handles both plain text and hashed passwords
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords:');
    console.log('Candidate password:', candidatePassword);
    console.log('Stored password:', this.password);
    
    // Direct comparison for plain text
    if (candidatePassword === this.password) {
      console.log('Password matches (plain text)');
      return true;
    }
    
    // If we have bcrypt hashed password (for future compatibility)
    if (this.password && this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      const bcrypt = require('bcrypt');
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      console.log('Bcrypt comparison result:', isMatch);
      return isMatch;
    }
    
    console.log('Password does not match');
    return false;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Don't return sensitive information in JSON responses
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.refreshToken;
  return values;
};

module.exports = User;
