'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, drop the existing foreign key constraint if it exists
    const [results] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'tasks' 
       AND COLUMN_NAME = 'projectId' 
       AND REFERENCED_TABLE_NAME IS NOT NULL`
    );

    if (results.length > 0) {
      const constraintName = results[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(
        `ALTER TABLE tasks DROP FOREIGN KEY ${constraintName}`
      );
    }

    // Then modify the column to be nullable
    await queryInterface.changeColumn('tasks', 'projectId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });

    // Finally, add the foreign key constraint with ON DELETE SET NULL
    await queryInterface.addConstraint('tasks', {
      fields: ['projectId'],
      type: 'foreign key',
      name: 'tasks_projectId_fk',
      references: {
        table: 'projects',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('tasks', 'tasks_projectId_fk');
    
    // Set the column back to NOT NULL
    await queryInterface.changeColumn('tasks', 'projectId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    
    // Add back the original foreign key constraint if needed
    // Note: You might need to adjust this based on your original constraint
    await queryInterface.addConstraint('tasks', {
      fields: ['projectId'],
      type: 'foreign key',
      name: 'tasks_projectId_fk',
      references: {
        table: 'projects',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
