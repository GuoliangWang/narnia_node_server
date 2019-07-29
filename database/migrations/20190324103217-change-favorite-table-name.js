'use strict';

module.exports = {
  up: async queryInterface => {
    await queryInterface.renameTable(
      'favorite',
      'favorites'
    );
  },
  down: async queryInterface => {
    await queryInterface.renameTable(
      'favorites',
      'favorite'
    );
  },
};
