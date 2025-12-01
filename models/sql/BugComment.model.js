const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const BugComment = sequelize.define('BugComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'bug_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
BugComment.associate = (models) => {
  BugComment.belongsTo(models.Bug, {
    foreignKey: 'bug_id',
    as: 'bug'
  });
  
  BugComment.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'author'
  });
};

module.exports = BugComment;
