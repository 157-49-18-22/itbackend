'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, remove the existing foreign key constraint
    await queryInterface.sequelize.query(
      'ALTER TABLE tasks DROP FOREIGN KEY tasks_ibfk_1;'
    );
    
    // Then modify the column to be nullable
    await queryInterface.sequelize.query(
      'ALTER TABLE tasks MODIFY COLUMN projectId INT NULL;'
    );
    
    // Add back the foreign key constraint with ON DELETE SET NULL
    await queryInterface.sequelize.query(
      'ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fk FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL ON UPDATE CASCADE;'
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint
    await queryInterface.sequelize.query(
      'ALTER TABLE tasks DROP FOREIGN KEY tasks_project_id_fk;'
    );
    
    // Set the column back to NOT NULL
    await queryInterface.sequelize.query(
      'ALTER TABLE tasks MODIFY COLUMN projectId INT NOT NULL;'
    );
    
    // Add back the original foreign key constraint
    await queryInterface.sequelize.query(
      'ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fk FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE;'
    );
  }
};
