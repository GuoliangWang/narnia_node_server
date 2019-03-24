'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable(
      'favorite',
      'favorites'
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable(
      'favorites',
      'favorite'
    )
  }
};