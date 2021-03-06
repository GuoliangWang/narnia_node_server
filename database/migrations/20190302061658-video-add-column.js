'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn(
      'videos',
      'slice_id',
      INTEGER
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('videos', 'slice_id');
  },
};
