'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING, NOW } = Sequelize;
    await queryInterface.createTable('popular_videos', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      video_id: INTEGER,
      weight: INTEGER,
      created_at: {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      },
      updated_at: {
        type: DATE,
        allowNull: false,
        defaultValue: NOW
      },
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('popular_videos');
  },
};