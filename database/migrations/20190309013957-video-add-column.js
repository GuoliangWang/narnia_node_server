'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.addColumn(
      'videos',
      'title',
      STRING
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('videos', 'title')
  }
};