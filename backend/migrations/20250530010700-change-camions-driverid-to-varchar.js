'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Changer le type de driverId en VARCHAR(255) (déjà fait manuellement)
    await queryInterface.changeColumn('camions', 'driverId', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    // Nettoyer les driverId invalides
    await queryInterface.sequelize.query(`
      UPDATE camions
      SET "driverId" = NULL
      WHERE "driverId" IS NOT NULL AND "driverId" NOT IN (SELECT id FROM utilisateurs);
    `);

    // Supprimer toute contrainte de clé étrangère existante
    await queryInterface.removeConstraint('camions', 'camions_driverId_fkey', {
      ifExists: true,
    });

    // Ajouter la nouvelle contrainte de clé étrangère
    await queryInterface.addConstraint('camions', {
      fields: ['driverId'],
      type: 'foreign key',
      name: 'camions_driverId_fkey',
      references: {
        table: 'utilisateurs',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Supprimer la contrainte de clé étrangère
    await queryInterface.removeConstraint('camions', 'camions_driverId_fkey', {
      ifExists: true,
    });

    // Revenir à UUID
    await queryInterface.changeColumn('camions', 'driverId', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
};