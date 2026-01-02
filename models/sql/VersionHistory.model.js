const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database.sql');

const VersionHistory = sequelize.define('VersionHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    version: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('major', 'minor', 'patch'),
        defaultValue: 'patch'
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
    release_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    release_time: {
        type: DataTypes.STRING,
        allowNull: true
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: true
    },
    commit_hash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    files_changed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    additions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    deletions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    changes: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('deployed', 'staging', 'development'),
        defaultValue: 'development'
    },
    deployed_to: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'version_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // No updated_at for this one to match previous schema? 
});

module.exports = VersionHistory;
