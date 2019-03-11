'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn(
      'messages',
      'status',
      INTEGER
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('messages', 'status')
  }
};