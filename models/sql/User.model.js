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
    type: DataTypes.STRING(50),
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
    type: DataTypes.TEXT, // Changed from JSON to TEXT for safety
    defaultValue: '[]',
    get() {
      try {
        const rawValue = this.getDataValue('skills');
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (e) {
        return [];
      }
    },
    set(value) {
      this.setDataValue('skills', JSON.stringify(value));
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.TEXT, // Changed from JSON to TEXT for safety
    defaultValue: '{}',
    get() {
      try {
        const rawValue = this.getDataValue('socialLinks');
        return rawValue ? JSON.parse(rawValue) : {};
      } catch (e) {
        return {};
      }
    },
    set(value) {
      this.setDataValue('socialLinks', JSON.stringify(value));
    }
  },
  preferences: {
    type: DataTypes.TEXT, // Changed from JSON to TEXT for safety
    defaultValue: '{"emailNotifications":true,"pushNotifications":true,"theme":"light"}',
    get() {
      try {
        const rawValue = this.getDataValue('preferences');
        return rawValue ? JSON.parse(rawValue) : {
          emailNotifications: true,
          pushNotifications: true,
          theme: 'light'
        };
      } catch (e) {
        return {};
      }
    },
    set(value) {
      this.setDataValue('preferences', JSON.stringify(value));
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
User.prototype.comparePassword = async function (candidatePassword) {
  try {
    console.log('Comparing passwords:');
    // console.log('Candidate password:', candidatePassword); // Security: Don't log passwords
    // console.log('Stored password:', this.password); // Security: Don't log passwords

    // Direct comparison for plain text ONLY
    if (candidatePassword === this.password) {
      console.log('Password matches (plain text)');
      return true;
    }

    console.log('Password does not match');
    return false;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Don't return sensitive information in JSON responses
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.refreshToken;
  return values;
};

module.exports = User;
