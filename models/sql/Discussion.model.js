const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Discussion = sequelize.define('Discussion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    replies_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_activity: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'discussions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Discussion;
