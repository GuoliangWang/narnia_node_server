'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('works', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      title: STRING,
      cover: STRING,
      user_id: INTEGER,
      state: INTEGER,
      privacy: INTEGER,
      created_at: DATE,
      updated_at: DATE,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('works');
  }
};