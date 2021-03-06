'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn(
      'works',
      'slice_id',
      INTEGER
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('works', 'slice_id');
  },
};
