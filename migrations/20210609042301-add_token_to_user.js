'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'Users',
        'token',
        Sequelize.TEXT);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
        'Users',
        'token'
    );
  }
};
