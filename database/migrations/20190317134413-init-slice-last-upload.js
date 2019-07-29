'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, NOW } = Sequelize;
    await queryInterface.createTable('slice_last_upload', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      slice_id: INTEGER,
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
    await queryInterface.dropTable('slice_last_upload');
  },
};
