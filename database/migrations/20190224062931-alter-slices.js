'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.addColumn(
      'slices',
      'text',
      STRING
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('slices', 'text')
  }
};