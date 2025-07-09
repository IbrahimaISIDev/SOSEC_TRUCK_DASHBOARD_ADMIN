// ============================================
// 1. CORRECTION DU BACKEND - camionController.ts
// ============================================

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Camion from '../models/camion';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
const sequelize = require('../config/db');
const { db } = require('../config/firebase');
import { Op } from 'sequelize';

// Validation rules for camion
export const camionValidationRules = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('type').notEmpty().withMessage('Le type est requis'),
  body('immatriculation')
    .optional()
    .isString()
    .withMessage('Immatriculation doit être une chaîne'),
  body('assuranceExpiration')
    .optional()
    .isISO8601()
    .withMessage("La date d'expiration de l'assurance est invalide"),
  body('driverId')
    .optional()
    .isString()
    .withMessage('driverId doit être une chaîne'),
];

export const createCamionHandler = async (req: Request, res: Response) => {
  try {
    logger.debug(`Raw request body: ${JSON.stringify(req.body, null, 2)}`);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      return res
        .status(400)
        .json({ error: 'Erreur de validation', details: errors.array() });
    }

    const {
      immatriculation,
      assuranceDetails,
      assuranceExpiration,
      nom,
      type,
      driverId,
    } = req.body;

    const result = await sequelize.transaction(async (t: any) => {
      let validatedDriverId: string | null = null;
      if (driverId) {
        const user = await Utilisateur.findByPk(driverId, { transaction: t });
        if (!user) {
          logger.error(`Chauffeur non trouvé pour driverId: ${driverId}`);
          throw new Error('Chauffeur non trouvé');
        }
        if (user.role !== 'driver') {
          logger.error(`Utilisateur n'est pas un chauffeur: ${driverId}`);
          throw new Error('Seul un chauffeur peut être affecté à un camion');
        }
        if (user.camionId) {
          logger.error(`Chauffeur déjà affecté à un autre camion: ${driverId}`);
          throw new Error('Ce chauffeur est déjà affecté à un autre camion');
        }
        const existingCamion = await Camion.findOne({
          where: { driverId },
          transaction: t,
        });
        if (existingCamion) {
          logger.error(`driverId déjà assigné à un autre camion: ${driverId}`);
          throw new Error('Ce chauffeur est déjà assigné à un autre camion');
        }
        validatedDriverId = driverId;
      }

      const camionData = {
        id: uuidv4(),
        immatriculation: immatriculation || null,
        nom: nom.trim(),
        type: type.trim(),
        assuranceDetails: assuranceDetails || null,
        assuranceExpiration: assuranceExpiration
          ? new Date(assuranceExpiration)
          : null,
        driverId: validatedDriverId,
        syncStatus: 'synced',
        time: new Date().toISOString(),
      };

      logger.debug(`Final camionData: ${JSON.stringify(camionData, null, 2)}`);

      const camion = await Camion.create(camionData, { transaction: t });

      if (validatedDriverId) {
        await Utilisateur.update(
          { camionId: camion.id },
          { where: { id: validatedDriverId }, transaction: t }
        );
        // CORRECTION: Mise à jour Firebase avec le nom du camion
        await db.ref(`users/${validatedDriverId}`).update({
          camionId: camion.id,
          camionNom: camion.nom, // ✅ Ajout du nom du camion
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      await db.ref(`camions/${camion.id}`).set({
        id: camion.id,
        nom: camion.nom,
        type: camion.type,
        immatriculation: camion.immatriculation,
        syncStatus: camion.syncStatus,
        time: camion.time,
        assuranceDetails: camion.assuranceDetails,
        assuranceExpiration: camion.assuranceExpiration?.toISOString() || null,
        driverId: camion.driverId || null,
        createdAt: camion.createdAt.toISOString(),
        updatedAt: camion.updatedAt.toISOString(),
      });

      return camion;
    });

    logger.info(`Camion créé et synchronisé avec Firebase: ID=${result.id}`);
    res.status(201).json(result);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la création du camion: ${error.message}, Stack: ${error.stack}`
    );
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeUniqueConstraintError'
    ) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: error.errors.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateCamionHandler = async (req: Request, res: Response) => {
  try {
    logger.debug(
      `Raw request body (update): ${JSON.stringify(req.body, null, 2)}`
    );

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      return res
        .status(400)
        .json({ error: 'Erreur de validation', details: errors.array() });
    }

    const { camionId } = req.params;
    const {
      immatriculation,
      assuranceDetails,
      assuranceExpiration,
      nom,
      type,
      driverId,
    } = req.body;

    const result = await sequelize.transaction(async (t: any) => {
      const camion = await Camion.findByPk(camionId, { transaction: t });
      if (!camion) {
        logger.warn(`Camion non trouvé pour l'ID: ${camionId}`);
        throw new Error('Camion non trouvé');
      }

      let validatedDriverId: string | null = null;
      if (driverId) {
        const user = await Utilisateur.findByPk(driverId, { transaction: t });
        if (!user) {
          logger.error(`Chauffeur non trouvé pour driverId: ${driverId}`);
          throw new Error('Chauffeur non trouvé');
        }
        if (user.role !== 'driver') {
          logger.error(`Utilisateur n'est pas un chauffeur: ${driverId}`);
          throw new Error('Seul un chauffeur peut être affecté à un camion');
        }
        if (user.camionId && user.camionId !== camion.id) {
          logger.error(`Chauffeur déjà affecté à un autre camion: ${driverId}`);
          throw new Error('Ce chauffeur est déjà affecté à un autre camion');
        }
        const existingCamion = await Camion.findOne({
          where: { driverId, id: { [Op.ne]: camion.id } },
          transaction: t,
        });
        if (existingCamion) {
          logger.error(`driverId déjà assigné à un autre camion: ${driverId}`);
          throw new Error('Ce chauffeur est déjà assigné à un autre camion');
        }
        validatedDriverId = driverId;
      }

      const updateData = {
        immatriculation: immatriculation || null,
        nom: nom.trim(),
        type: type.trim(),
        assuranceDetails: assuranceDetails || null,
        assuranceExpiration: assuranceExpiration
          ? new Date(assuranceExpiration)
          : null,
        driverId: validatedDriverId,
        syncStatus: 'synced',
        time: new Date().toISOString(),
      };

      logger.debug(`Final updateData: ${JSON.stringify(updateData, null, 2)}`);

      // Gérer les changements de chauffeur
      if (camion.driverId && camion.driverId !== validatedDriverId) {
        await Utilisateur.update(
          { camionId: null },
          { where: { id: camion.driverId }, transaction: t }
        );
        // CORRECTION: Retirer le nom du camion de l'ancien chauffeur
        await db.ref(`users/${camion.driverId}`).update({
          camionId: null,
          camionNom: null, // ✅ Suppression du nom du camion
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      if (validatedDriverId && validatedDriverId !== camion.driverId) {
        await Utilisateur.update(
          { camionId: camion.id },
          { where: { id: validatedDriverId }, transaction: t }
        );
        // CORRECTION: Ajouter le nom du camion au nouveau chauffeur
        await db.ref(`users/${validatedDriverId}`).update({
          camionId: camion.id,
          camionNom: updateData.nom, // ✅ Ajout du nom du camion
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      // Si le nom du camion a changé, mettre à jour le chauffeur actuel
      if (camion.driverId && camion.nom !== updateData.nom) {
        await db.ref(`users/${camion.driverId}`).update({
          camionNom: updateData.nom, // ✅ Mise à jour du nom du camion
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      await camion.update(updateData, { transaction: t });

      await db.ref(`camions/${camion.id}`).update({
        id: camion.id,
        nom: camion.nom,
        type: camion.type,
        immatriculation: camion.immatriculation,
        syncStatus: camion.syncStatus,
        time: camion.time,
        assuranceDetails: camion.assuranceDetails,
        assuranceExpiration: camion.assuranceExpiration?.toISOString() || null,
        driverId: camion.driverId || null,
        updatedAt: camion.updatedAt.toISOString(),
      });

      return camion;
    });

    logger.info(
      `Camion mis à jour et synchronisé avec Firebase: ID=${result.id}`
    );
    res.status(200).json(result);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la mise à jour du camion: ${error.message}, Stack: ${error.stack}`
    );
    if (
      error.name === 'SequelizeValidationError' ||
      error.name === 'SequelizeUniqueConstraintError'
    ) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: error.errors.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
    res.status(400).json({ error: error.message });
  }
};

export const getCamionHandler = async (req: Request, res: Response) => {
  try {
    const { camionId } = req.params;
    const camion = await Camion.findByPk(camionId);
    if (!camion) {
      logger.warn(`Camion non trouvé pour l'ID: ${camionId}`);
      return res.status(404).json({ error: 'Camion non trouvé' });
    }
    res.status(200).json(camion);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la récupération du camion: ${error.message}, Stack: ${error.stack}`
    );
    res.status(500).json({ error: error.message });
  }
};

export const getAllCamionsHandler = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Camion.findAndCountAll({
      limit: pageSize,
      offset,
    });

    logger.info(
      `Récupération des camions: page=${page}, pageSize=${pageSize}, total=${count}`
    );
    res.status(200).json({ camions: rows, total: count });
  } catch (error: any) {
    logger.error(
      `Erreur lors de la récupération des camions: ${error.message}, Stack: ${error.stack}`
    );
    res.status(500).json({ error: error.message });
  }
};

export const deleteCamionHandler = async (req: Request, res: Response) => {
  try {
    const { camionId } = req.params;

    const result = await sequelize.transaction(async (t: any) => {
      const camion = await Camion.findByPk(camionId, { transaction: t });
      if (!camion) {
        logger.warn(`Camion non trouvé pour l'ID: ${camionId}`);
        throw new Error('Camion non trouvé');
      }

      if (camion.driverId) {
        await Utilisateur.update(
          { camionId: null },
          { where: { id: camion.driverId }, transaction: t }
        );
        // CORRECTION: Retirer le nom du camion lors de la suppression
        await db.ref(`users/${camion.driverId}`).update({
          camionId: null,
          camionNom: null, // ✅ Suppression du nom du camion
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      await camion.destroy({ transaction: t });
      await db.ref(`camions/${camionId}`).remove();

      return true;
    });

    logger.info(`Camion supprimé: ID=${camionId}`);
    res.status(204).send();
  } catch (error: any) {
    logger.error(
      `Erreur lors de la suppression du camion: ${error.message}, Stack: ${error.stack}`
    );
    res.status(500).json({ error: error.message });
  }
};
