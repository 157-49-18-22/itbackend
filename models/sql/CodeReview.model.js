const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const CodeReview = sequelize.define('CodeReview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    author: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reviewer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: true
    },
    code_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    files_changed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lines_added: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lines_removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'code_reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CodeReview;
