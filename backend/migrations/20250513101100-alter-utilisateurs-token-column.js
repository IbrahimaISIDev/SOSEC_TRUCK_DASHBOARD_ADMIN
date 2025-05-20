// migrations/20250513101100-alter-utilisateurs-token-column.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('utilisateurs', 'token', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('utilisateurs', 'token', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};