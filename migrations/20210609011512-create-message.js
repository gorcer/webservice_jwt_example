'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
        await queryInterface.createTable('Messages', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          userId: {
              type: Sequelize.INTEGER,
              references: {
                  model: 'Users',
                  key: 'id'
              },
              allowNull: false
          },
          content: {
            type: Sequelize.TEXT
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        });

    } catch (err) {
        throw err;
    }

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Messages');
  }
};