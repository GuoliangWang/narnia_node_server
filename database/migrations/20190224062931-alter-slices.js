'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.addColumn(
      'slices',
      'text',
      STRING
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('slices', 'text');
  },
};
