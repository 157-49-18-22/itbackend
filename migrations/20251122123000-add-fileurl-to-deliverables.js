'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('deliverables', 'fileUrl', {
      type: Sequelize.STRING(500),
      allowNull: true, // Temporarily allow null for existing records
      after: 'version'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('deliverables', 'fileUrl');
  }
};
