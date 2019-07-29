'use strict';

module.exports = {
  up: async queryInterface => {
    await queryInterface.renameTable(
      'slices',
      'slice'
    );
  },
  down: async queryInterface => {
    await queryInterface.renameTable(
      'slice',
      'slices'
    );
  },
};
