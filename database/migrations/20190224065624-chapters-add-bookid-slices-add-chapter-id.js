'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn(
      'chapters',
      'book_id',
      INTEGER
    );
    await queryInterface.addColumn(
      'slices',
      'chapter_id',
      INTEGER
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('chapters', 'book_id');
    await queryInterface.removeColumn('slices', 'chapter_id');
  },
};
