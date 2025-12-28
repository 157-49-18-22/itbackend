const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PerformanceTest = sequelize.define('PerformanceTest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'project_id',
        references: {
            model: 'projects',
            key: 'id'
        }
    },
    testName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'test_name'
    },
    testType: {
        type: DataTypes.STRING, // 'load', 'stress', 'soak', etc.
        allowNull: false,
        field: 'test_type'
    },
    status: {
        type: DataTypes.ENUM('passed', 'warning', 'failed', 'running'),
        defaultValue: 'running'
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER, // in seconds
        allowNull: true
    },
    concurrentUsers: {
        type: DataTypes.INTEGER,
        field: 'concurrent_users',
        allowNull: true
    },
    targetResponseTime: {
        type: DataTypes.INTEGER, // in ms
        field: 'target_response_time',
        allowNull: true
    },
    avgResponseTime: {
        type: DataTypes.INTEGER, // in ms
        field: 'avg_response_time',
        defaultValue: 0
    },
    maxResponseTime: {
        type: DataTypes.INTEGER,
        field: 'max_response_time',
        defaultValue: 0
    },
    minResponseTime: {
        type: DataTypes.INTEGER,
        field: 'min_response_time',
        defaultValue: 0
    },
    throughput: {
        type: DataTypes.FLOAT, // req/sec
        defaultValue: 0
    },
    errorRate: {
        type: DataTypes.FLOAT, // percentage
        field: 'error_rate',
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
    }
}, {
    tableName: 'performance_tests',
    timestamps: true,
    underscored: true
});

// Define associations
PerformanceTest.associate = (models) => {
    PerformanceTest.belongsTo(models.Project, {
        foreignKey: 'projectId',
        as: 'project'
    });
};

module.exports = PerformanceTest;
