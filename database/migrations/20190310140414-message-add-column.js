'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn(
      'messages',
      'ref_id',
      INTEGER
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('messages', 'ref_id');
  },
};
