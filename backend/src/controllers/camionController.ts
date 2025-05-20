import { Request, Response } from 'express';
import Camion from '../models/camion';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';

export const createCamionHandler = async (req: Request, res: Response) => {
  try {
    logger.debug(`Content-Type: ${req.get('Content-Type')}`);
    logger.debug(`Raw request body: ${JSON.stringify(req.body, null, 2)}`);

    const {
      immatriculation,
      assuranceDetails,
      assuranceExpiration,
      nom,
      type,
      driverId,
    } = req.body;

    if (!nom) {
      logger.error(`Nom manquant. Type: ${typeof nom}, Valeur: ${nom}`);
      return res.status(400).json({
        error: "Le champ 'nom' est requis",
      });
    }
    if (typeof nom !== 'string') {
      logger.error(`Nom n'est pas une chaîne. Type: ${typeof nom}`);
      return res.status(400).json({
        error: "Le champ 'nom' doit être une chaîne",
      });
    }
    if (!nom.trim()) {
      logger.error(`Nom est vide après trim: '${nom}'`);
      return res.status(400).json({
        error: "Le champ 'nom' ne peut pas être vide",
      });
    }

    if (!type) {
      logger.error(`Type manquant. Type: ${typeof type}, Valeur: ${type}`);
      return res.status(400).json({
        error: "Le champ 'type' est requis",
      });
    }
    if (typeof type !== 'string') {
      logger.error(`Type n'est pas une chaîne. Type: ${typeof type}`);
      return res.status(400).json({
        error: "Le champ 'type' doit être une chaîne",
      });
    }
    if (!type.trim()) {
      logger.error(`Type est vide après trim: '${type}'`);
      return res.status(400).json({
        error: "Le champ 'type' ne peut pas être vide",
      });
    }

    let validatedDriverId = null;
    if (driverId) {
      const user = await Utilisateur.findByPk(driverId);
      if (!user) {
        logger.error(`Chauffeur non trouvé pour driverId: ${driverId}`);
        return res.status(404).json({ error: 'Chauffeur non trouvé' });
      }
      if (user.role !== 'driver') {
        logger.error(`Utilisateur n'est pas un chauffeur: ${driverId}`);
        return res
          .status(400)
          .json({ error: 'Seul un chauffeur peut être affecté à un camion' });
      }
      if (user.camionId) {
        logger.error(`Chauffeur déjà affecté à un autre camion: ${driverId}`);
        return res
          .status(400)
          .json({ error: 'Ce chauffeur est déjà affecté à un autre camion' });
      }
      validatedDriverId = driverId;
    }

    const nomTrimmed = nom.trim();
    const typeTrimmed = type.trim();

    const camionData = {
      id: uuidv4(),
      immatriculation: immatriculation || null,
      nom: nomTrimmed,
      type: typeTrimmed,
      assuranceDetails: assuranceDetails || null,
      assuranceExpiration: assuranceExpiration
        ? new Date(assuranceExpiration)
        : null,
      driverId: validatedDriverId,
      syncStatus: 'synced',
      time: new Date().toISOString(),
    };

    logger.debug(`Final camionData: ${JSON.stringify(camionData, null, 2)}`);

    const camion = await Camion.create(camionData, {
      logging: (sql) => logger.debug(`SQL executed: ${sql}`),
    });

    if (validatedDriverId) {
      await Utilisateur.update(
        { camionId: camion.id },
        { where: { id: validatedDriverId } }
      );
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

    if (validatedDriverId) {
      await db.ref(`users/${validatedDriverId}`).update({
        camionId: camion.id,
        syncStatus: 'pending',
        time: new Date().toISOString(),
      });
    }

    logger.info(`Camion créé et synchronisé avec Firebase: ID=${camion.id}`);
    res.status(201).json(camion);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la création du camion: ${error.message}, Stack: ${error.stack}`
    );
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors
        .map((err: any) => `${err.path}: ${err.message}`)
        .join(', ');
      return res
        .status(400)
        .json({ error: `Erreur de validation: ${messages}` });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateCamionHandler = async (req: Request, res: Response) => {
  try {
    logger.debug(
      `Raw request body (update): ${JSON.stringify(req.body, null, 2)}`
    );

    const { camionId } = req.params;
    const {
      immatriculation,
      assuranceDetails,
      assuranceExpiration,
      nom,
      type,
      driverId,
    } = req.body;

    if (!nom || typeof nom !== 'string' || !nom.trim()) {
      logger.error(`Invalid nom: ${nom}`);
      return res.status(400).json({
        error: "Le champ 'nom' est requis et doit être une chaîne non vide.",
      });
    }
    if (!type || typeof type !== 'string' || !type.trim()) {
      logger.error(`Invalid type: ${type}`);
      return res.status(400).json({
        error: "Le champ 'type' est requis et doit être une chaîne non vide.",
      });
    }

    const camion = await Camion.findByPk(camionId);
    if (!camion) {
      logger.warn(`Camion non trouvé pour l'ID: ${camionId}`);
      return res.status(404).json({ error: 'Camion non trouvé' });
    }

    let validatedDriverId = null;
    if (driverId) {
      const user = await Utilisateur.findByPk(driverId);
      if (!user) {
        logger.error(`Chauffeur non trouvé pour driverId: ${driverId}`);
        return res.status(404).json({ error: 'Chauffeur non trouvé' });
      }
      if (user.role !== 'driver') {
        logger.error(`Utilisateur n'est pas un chauffeur: ${driverId}`);
        return res
          .status(400)
          .json({ error: 'Seul un chauffeur peut être affecté à un camion' });
      }
      if (user.camionId && user.camionId !== camion.id) {
        logger.error(`Chauffeur déjà affecté à un autre camion: ${driverId}`);
        return res
          .status(400)
          .json({ error: 'Ce chauffeur est déjà affecté à un autre camion' });
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

    await camion.update(updateData);

    if (camion.driverId !== validatedDriverId) {
      if (camion.driverId) {
        await Utilisateur.update(
          { camionId: null },
          { where: { id: camion.driverId } }
        );
        await db.ref(`users/${camion.driverId}`).update({
          camionId: null,
          syncStatus: 'pending',
          time: new Date().toISOString(),
        });
      }
      if (validatedDriverId) {
        await Utilisateur.update(
          { camionId: camion.id },
          { where: { id: validatedDriverId } }
        );
        await db.ref(`users/${validatedDriverId}`).update({
          camionId: camion.id,
          syncStatus: 'pending',
          time: new Date().toISOString(),
        });
      }
    }

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

    logger.info(
      `Camion mis à jour et synchronisé avec Firebase: ID=${camion.id}`
    );
    res.status(200).json(camion);
  } catch (error: any) {
    logger.error(`Erreur: ${error.message}, Stack: ${error.stack}`);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors
        .map((err: any) => `${err.path}: ${err.message}`)
        .join(', ');
      return res
        .status(400)
        .json({ error: `Erreur de validation: ${messages}` });
    }
    res.status(500).json({ error: error.message });
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
    logger.error(`Erreur lors de la récupération du camion: ${error.message}`);
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
      `Erreur lors de la récupération des camions: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
};

export const deleteCamionHandler = async (req: Request, res: Response) => {
  try {
    const { camionId } = req.params;
    const camion = await Camion.findByPk(camionId);
    if (!camion) {
      logger.warn(`Camion non trouvé pour l'ID: ${camionId}`);
      return res.status(404).json({ error: 'Camion non trouvé' });
    }
    await camion.destroy();
    await db.ref(`camions/${camionId}`).remove();
    logger.info(`Camion supprimé: ID=${camionId}`);
    res.status(204).json();
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression du camion: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
