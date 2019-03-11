'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn(
      'favorite',
      'is_del',
      INTEGER
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('favorite', 'is_del')
  }
};