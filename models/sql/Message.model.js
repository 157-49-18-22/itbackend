const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  thread: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  recipients: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  readBy: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isStarred: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parentMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  }
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    { fields: ['thread'] },
    { fields: ['senderId'] },
    { fields: ['projectId'] }
  ]
});

module.exports = Message;
