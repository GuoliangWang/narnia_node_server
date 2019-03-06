'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, FLOAT } = Sequelize;
    await queryInterface.addColumn(
      'videos',
      'width',
      INTEGER
    )
    await queryInterface.addColumn(
      'videos',
      'height',
      INTEGER
    )
    await queryInterface.addColumn(
      'videos',
      'size',
      INTEGER
    )
    await queryInterface.addColumn(
      'videos',
      'duration',
      FLOAT
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('videos', 'width')
    await queryInterface.removeColumn('videos', 'height')
    await queryInterface.removeColumn('videos', 'size')
    await queryInterface.removeColumn('videos', 'duration')
  }
};