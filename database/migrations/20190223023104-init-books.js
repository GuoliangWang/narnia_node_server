'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('books', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      title: STRING,
      cover: STRING,
      created_at: DATE,
      updated_at: DATE,
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('books');
  },
};
