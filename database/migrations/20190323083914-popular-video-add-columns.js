'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn(
      'popular_videos',
      'status',
      INTEGER
    )
    await queryInterface.addColumn(
      'popular_videos',
      'is_del',
      {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    )

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('popular_videos', 'status')
    await queryInterface.removeColumn('popular_videos', 'is_del')
  }
};