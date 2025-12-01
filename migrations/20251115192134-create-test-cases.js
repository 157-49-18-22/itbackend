'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_cases', {
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
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('functional', 'integration', 'regression', 'smoke', 'sanity', 'performance'),
        defaultValue: 'functional'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('not_run', 'passed', 'failed', 'blocked'),
        defaultValue: 'not_run'
      },
      steps: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Stores array of {step: string, expected: string}'
      },
      expected_result: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      last_run: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create test_results table
    await queryInterface.createTable('test_results', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      test_case_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_cases',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('passed', 'failed', 'blocked'),
        allowNull: false
      },
      executed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('test_cases', ['project_id']);
    await queryInterface.addIndex('test_cases', ['created_by']);
    await queryInterface.addIndex('test_cases', ['assigned_to']);
    await queryInterface.addIndex('test_results', ['test_case_id']);
    await queryInterface.addIndex('test_results', ['executed_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_results');
    await queryInterface.dropTable('test_cases');
  }
};
