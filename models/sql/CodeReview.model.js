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
        type: DataTypes.STRING,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'approved', 'rejected']]
        }
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'medium',
        validate: {
            isIn: [['low', 'medium', 'high']]
        }
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
