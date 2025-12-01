'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, remove the foreign key constraint
    await queryInterface.removeConstraint('Tasks', 'Tasks_projectId_fkey');
    
    // Then modify the column to be nullable
    await queryInterface.changeColumn('Tasks', 'projectId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes if needed
    await queryInterface.changeColumn('Tasks', 'projectId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
