const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const Blocker = sequelize.define('Blocker', {
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
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM('open', 'in-progress', 'resolved', 'closed'),
        defaultValue: 'open'
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
    reportedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    resolvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Blockers',
    timestamps: true
});

module.exports = Blocker;
