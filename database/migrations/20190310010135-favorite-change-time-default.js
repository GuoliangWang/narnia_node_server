'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DATE, NOW } = Sequelize;
    await queryInterface.changeColumn(
      'favorite',
      'created_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'favorite',
      'updated_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
  },
  down: async (queryInterface, Sequelize) => {
      'created_at',
    await queryInterface.changeColumn('favorite', 'created_at', DATE)
    await queryInterface.changeColumn('favorite', 'updated_at', DATE)
  }
};
