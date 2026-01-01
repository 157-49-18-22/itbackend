const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contact: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // contactPerson field removed in favor of simple 'contact' string
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Prospect'),
    defaultValue: 'Active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  socialLinks: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  billingInfo: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'clients',
  timestamps: true
});

module.exports = Client;
