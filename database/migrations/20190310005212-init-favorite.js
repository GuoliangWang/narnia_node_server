'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('favorite', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      userid: STRING,
      type: INTEGER, // 1: 视频
      target_id: INTEGER,
      created_at: DATE,
      updated_at: DATE,
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('favorite');
  },
};