const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Deliverable = sequelize.define('Deliverable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('Wireframe', 'Mockup', 'Prototype', 'Design System', 'Code', 'Documentation', 'Report', 'Other'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Draft', 'In Review', 'Approved', 'Rejected', 'Final'),
    defaultValue: 'Draft'
  },
  version: {
    type: DataTypes.STRING(50),
    defaultValue: 'v1.0'
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  fileType: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  uploadedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  phase: {
    type: DataTypes.ENUM('UI/UX', 'Development', 'Testing', 'Deployment'),
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  versions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  approvals: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'deliverables',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['uploadedById'] },
    { fields: ['phase'] },
    { fields: ['status'] }
  ]
});

module.exports = Deliverable;
