'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deployments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      environment: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'development'
      },
      branch: {
        type: Sequelize.STRING,
        allowNull: false
      },
      commitHash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      commitMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'success', 'failed'),
        defaultValue: 'pending'
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deployedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deployments');
  }
};
