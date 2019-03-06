'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable(
      'slices',
      'slice'
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable(
      'slice',
      'slices'
    )
  }
};