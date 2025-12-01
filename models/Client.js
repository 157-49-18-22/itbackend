const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.sql');

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
  contact: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  company: {
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
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.JSON,
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
  contactPerson: {
    type: DataTypes.JSON,
    allowNull: true
  },
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
    allowNull: true
  },
  socialLinks: {
    type: DataTypes.JSON,
    allowNull: true
  },
  billingInfo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // These fields should match your database exactly
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'createdAt'  // Match the exact case as in your database
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updatedAt'  // Match the exact case as in your database
  }
}, {
  // Use the exact field names as in the database
  tableName: 'clients',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  // Prevent Sequelize from adding the 's' to the table name
  freezeTableName: true
});

module.exports = Client;
