const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('Meeting', 'Deadline', 'Milestone', 'Review', 'Holiday', 'Other'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  allDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meetingLink: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  attendees: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  reminder: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      minutesBefore: 15
    }
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#3b82f6'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurrence: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'calendar_events',
  timestamps: true,
  indexes: [
    { fields: ['startDate'] },
    { fields: ['endDate'] },
    { fields: ['projectId'] },
    { fields: ['organizerId'] }
  ]
});

module.exports = CalendarEvent;
