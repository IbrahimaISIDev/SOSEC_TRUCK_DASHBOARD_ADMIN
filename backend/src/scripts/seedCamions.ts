const sequelize = require('../config/db');
import Camion from '../models/camion';

const seedCamions = async () => {
  try {
    await sequelize.sync({ force: true }); // Utilise { force: false } en production
    await Camion.create({
      matricule: 'SN-123-AB',
      photoUrl: 'https://example.com/camion1.jpg',
      assuranceDetails: JSON.stringify({
        numeroPolice: 'A123456',
        compagnie: 'Assurance XYZ',
        couverture: 'Tout risque',
      }),
      assuranceExpiration: new Date('2025-12-31'),
    });
    await Camion.create({
      matricule: 'SN-456-CD',
      photoUrl: 'https://example.com/camion2.jpg',
      assuranceDetails: JSON.stringify({
        numeroPolice: 'B789012',
        compagnie: 'Assurance ABC',
        couverture: 'Standard',
      }),
      assuranceExpiration: new Date('2025-06-30'),
    });
    console.log('Camions insérés avec succès !');
    const camions = await Camion.findAll();
    console.log('Camions créés:', camions);
  } catch (error: any) {
    console.error('Erreur lors de l\'insertion des camions:', error.message);
  } finally {
    await sequelize.close();
  }
};

seedCamions();