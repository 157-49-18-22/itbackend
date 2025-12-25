const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('code-review', 'peer-review', 'client-feedback', 'admin-feedback'),
        allowNull: false
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Tasks',
            key: 'id'
        }
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    taskName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    suggestions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM('pending', 'addressed', 'dismissed'),
        defaultValue: 'pending'
    },
    reviewerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    developerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    addressedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Feedbacks',
    timestamps: true
});

module.exports = Feedback;
