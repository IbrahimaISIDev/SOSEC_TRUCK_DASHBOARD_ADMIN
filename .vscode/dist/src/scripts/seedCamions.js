"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const camion_1 = __importDefault(require("../models/camion"));
const seedCamions = async () => {
    try {
        await db_1.default.sync({ force: true }); // Utilise { force: false } en production
        await camion_1.default.create({
            matricule: 'SN-123-AB',
            photoUrl: 'https://example.com/camion1.jpg',
            assuranceDetails: JSON.stringify({
                numeroPolice: 'A123456',
                compagnie: 'Assurance XYZ',
                couverture: 'Tout risque',
            }),
            assuranceExpiration: new Date('2025-12-31'),
        });
        await camion_1.default.create({
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
        const camions = await camion_1.default.findAll();
        console.log('Camions créés:', camions);
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des camions:', error.message);
    }
    finally {
        await db_1.default.close();
    }
};
seedCamions();
