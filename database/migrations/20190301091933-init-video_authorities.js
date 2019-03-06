'use strict';

module.exports = {
  // The function called when performing a database upgrade, create a `videos` table
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('video_authorities', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      video_id: INTEGER,
      user_id: STRING,
      auth: INTEGER,  // 1 读 
      created_at: DATE,
      updated_at: DATE,
      is_del: INTEGER
    });
  },
  // The function called when performing a database downgrade, delete the `videos` table
  down: async queryInterface => {
    await queryInterface.dropTable('video_authorities');
  },
};