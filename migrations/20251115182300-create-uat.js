'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UATs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      steps: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('pending', 'in-progress', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
      },
      tester: {
        type: Sequelize.STRING,
        allowNull: true
      },
      commentsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Projects', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add foreign key index for better query performance
    await queryInterface.addIndex('UATs', ['projectId']);
    await queryInterface.addIndex('UATs', ['createdBy']);
    await queryInterface.addIndex('UATs', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UATs');
  }
};
