'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, NOW } = Sequelize;
    await queryInterface.createTable('chapter_last_upload', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      chapter_id: INTEGER,
      video_id: INTEGER,
      created_at: {
        type: DATE,
        allowNull: false,
        defaultValue: NOW,
      },
      updated_at: {
        type: DATE,
        allowNull: false,
        defaultValue: NOW,
      },
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('chapter_last_upload');
  },
};
