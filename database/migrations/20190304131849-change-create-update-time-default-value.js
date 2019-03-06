'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DATE, NOW } = Sequelize;
    await queryInterface.changeColumn(
      'books',
      'created_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'books',
      'updated_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'chapters',
      'created_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'chapters',
      'updated_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'slice',
      'created_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'slice',
      'updated_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'videos',
      'created_at',
      {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      }
    )
    await queryInterface.changeColumn(
      'videos',
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
    await queryInterface.changeColumn('books', 'created_at', DATE)
    await queryInterface.changeColumn('books', 'updated_at', DATE)
    await queryInterface.changeColumn('chapters', 'created_at', DATE)
    await queryInterface.changeColumn('chapters', 'updated_at', DATE)
    await queryInterface.changeColumn('slice', 'created_at', DATE)
    await queryInterface.changeColumn('slice', 'updated_at', DATE)
    await queryInterface.changeColumn('videos', 'created_at', DATE)
    await queryInterface.changeColumn('videos', 'updated_at', DATE)
  }
};
