'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('utilisateurs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      role: {
        type: Sequelize.ENUM('admin', 'driver'),
        allowNull: false,
      },
      permisNumero: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      permisDelivrance: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      permisExpiration: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      permisLieu: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      permisCategorie: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      syncStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('utilisateurs');
  },
};