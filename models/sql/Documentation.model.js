const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Documentation = sequelize.define('Documentation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    author: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        validate: {
            isIn: [['draft', 'published', 'archived']]
        }
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sections_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'last_updated'
});

module.exports = Documentation;
