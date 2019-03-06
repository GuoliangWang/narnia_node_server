'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.changeColumn(
      'slices',
      'text',
      {type: STRING(4096)}
    )
  },
  down: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    await queryInterface.changeColumn(
      'slices',
      'text',
      STRING
    )
  }
};