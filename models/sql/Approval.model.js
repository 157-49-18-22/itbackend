const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  approvalId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('Deliverable', 'Stage Transition', 'Bug Fix', 'Design', 'Code Review'),
    allowNull: false
  },
  title: {
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
  requestedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  requestedToId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
    defaultValue: 'Pending'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  version: {
    type: DataTypes.STRING(50),
    defaultValue: '-'
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  relatedDeliverableId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'deliverables',
      key: 'id'
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'approvals',
  timestamps: true,
  hooks: {
    beforeCreate: async (approval) => {
      if (!approval.approvalId) {
        const count = await Approval.count();
        approval.approvalId = `AP-${1000 + count + 1}`;
      }
    }
  },
  indexes: [
    { fields: ['projectId'] },
    { fields: ['requestedToId'] },
    { fields: ['status'] }
  ]
});

module.exports = Approval;
