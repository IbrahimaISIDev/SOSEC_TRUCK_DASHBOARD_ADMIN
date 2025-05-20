// migrations/20250513124700-update-camions-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('camions', 'nom', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('camions', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('camions', 'syncStatus', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('camions', 'time', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('camions', 'assuranceDetails', {
      type: Sequelize.JSON, // or Sequelize.JSONB for PostgreSQL
      allowNull: true,
    });
    await queryInterface.addColumn('camions', 'assuranceExpiration', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    // Make immatriculation nullable to match the model
    await queryInterface.changeColumn('camions', 'immatriculation', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('camions', 'nom');
    await queryInterface.removeColumn('camions', 'type');
    await queryInterface.removeColumn('camions', 'syncStatus');
    await queryInterface.removeColumn('camions', 'time');
    await queryInterface.removeColumn('camions', 'assuranceDetails');
    await queryInterface.removeColumn('camions', 'assuranceExpiration');
    await queryInterface.changeColumn('camions', 'immatriculation', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};