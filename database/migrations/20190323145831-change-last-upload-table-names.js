'use strict';

module.exports = {
  up: async queryInterface => {
    await queryInterface.renameTable(
      'book_last_upload',
      'book_last_uploads'
    );
    await queryInterface.renameTable(
      'chapter_last_upload',
      'chapter_last_uploads'
    );
    await queryInterface.renameTable(
      'slice_last_upload',
      'slice_last_uploads'
    );
  },
  down: async queryInterface => {
    await queryInterface.renameTable(
      'book_last_uploads',
      'book_last_upload'
    );
    await queryInterface.renameTable(
      'chapter_last_uploads',
      'chapter_last_upload'
    );
    await queryInterface.renameTable(
      'slice_last_uploads',
      'slice_last_upload'
    );
  },
};
