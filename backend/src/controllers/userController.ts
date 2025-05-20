import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';
import Camion from '../models/camion';
import { db } from '../config/firebase';

export const createUserHandler = [
  ...require('../validations/userValidation').createUserValidationRules,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      return res
        .status(400)
        .json({ error: 'Erreur de validation', details: errors.array() });
    }

    try {
      const {
        nom,
        email,
        role,
        password,
        permisNumero,
        permisDelivrance,
        permisExpiration,
        permisLieu,
        permisCategorie,
        camionId,
      } = req.body;
      logger.info('Données utilisateur reçues:', {
        nom,
        email,
        role,
        password: '[provided]',
        permisNumero,
        permisDelivrance,
        permisExpiration,
        permisLieu,
        permisCategorie,
        camionId,
      });

      // Vérifier que password est fourni
      if (!password) {
        return res
          .status(400)
          .json({ error: 'Le mot de passe est requis pour créer un utilisateur.' });
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await Utilisateur.create({
        nom,
        email,
        role,
        password: hashedPassword,
        permisNumero,
        permisDelivrance: permisDelivrance || null,
        permisExpiration: permisExpiration || null,
        permisLieu,
        permisCategorie,
        camionId: camionId || null,
      });

      // Synchronisation avec Firebase
      await db.ref(`users/${user.id}`).set({
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        permisNumero: user.permisNumero,
        permisDelivrance: user.permisDelivrance?.toISOString() || null,
        permisExpiration: user.permisExpiration?.toISOString() || null,
        permisLieu: user.permisLieu,
        permisCategorie: user.permisCategorie,
        camionId: user.camionId,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });

      logger.info(`Utilisateur créé et synchronisé: ${user.id}`);
      res.status(201).json(user);
    } catch (error: any) {
      logger.error(
        `Erreur lors de la création de l'utilisateur: ${error.message}`,
        { stack: error.stack }
      );
      if (
        error.name === 'SequelizeValidationError' ||
        error.name === 'SequelizeUniqueConstraintError'
      ) {
        return res
          .status(400)
          .json({
            error: 'Erreur de validation',
            details: error.errors.map((e: any) => ({
              field: e.path,
              message: e.message,
            })),
          });
      }
      res.status(400).json({ error: error.message });
    }
  },
];

export const getUserHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    logger.info(`Tentative de récupération de l'utilisateur avec ID: ${userId}`);
    const user = await Utilisateur.findByPk(userId);
    if (!user) {
      logger.warn(`Utilisateur non trouvé pour ID: ${userId}`);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    logger.info(`Utilisateur trouvé: ${userId}`);
    res.status(200).json(user);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la récupération de l'utilisateur: ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({ error: error.message });
  }
};

export const updateUserHandler = [
  ...require('../validations/userValidation').updateUserValidationRules,
  async (req: Request, res: Response) => {
    logger.info('Entrée dans updateUserHandler', {
      url: req.url,
      method: req.method,
      userId: req.params.userId,
      auth: req.headers.authorization ? 'Authorization present' : 'No Authorization header',
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      return res
        .status(400)
        .json({ error: 'Erreur de validation', details: errors.array() });
    }

    try {
      const { userId } = req.params;
      const {
        nom,
        email,
        role,
        password,
        permisNumero,
        permisDelivrance,
        permisExpiration,
        permisLieu,
        permisCategorie,
        camionId,
      } = req.body;

      logger.info('Données de mise à jour reçues:', {
        userId,
        nom,
        email,
        role,
        password: password ? '[provided]' : '[not provided]',
        permisNumero,
        permisDelivrance,
        permisExpiration,
        permisLieu,
        permisCategorie,
        camionId,
      });

      // Trouver l'utilisateur
      logger.info(`Recherche de l'utilisateur avec ID: ${userId}`);
      const user = await Utilisateur.findByPk(userId);
      if (!user) {
        logger.warn(`Utilisateur non trouvé pour ID: ${userId}`);
        return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }
      logger.info(`Utilisateur trouvé: ${userId}`);

      // Préparer les données de mise à jour
      const updateData: Partial<Utilisateur> = {
        nom,
        email,
        role,
        permisNumero,
        permisDelivrance: permisDelivrance || null,
        permisExpiration: permisExpiration || null,
        permisLieu,
        permisCategorie,
        camionId: camionId || null,
      };

      // Hasher le mot de passe si fourni
      if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      // Mettre à jour l'utilisateur
      logger.info(`Mise à jour de l'utilisateur: ${userId}`);
      await user.update(updateData);

      // Synchronisation avec Firebase
      logger.info(`Synchronisation Firebase pour utilisateur: ${user.id}`);
      await db.ref(`users/${user.id}`).set({
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        permisNumero: user.permisNumero,
        permisDelivrance: user.permisDelivrance?.toISOString() || null,
        permisExpiration: user.permisExpiration?.toISOString() || null,
        permisLieu: user.permisLieu,
        permisCategorie: user.permisCategorie,
        camionId: user.camionId,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });

      logger.info(`Utilisateur mis à jour et synchronisé: ${user.id}`);
      res.status(200).json(user);
    } catch (error: any) {
      logger.error(
        `Erreur lors de la mise à jour de l'utilisateur: ${error.message}`,
        { stack: error.stack }
      );
      if (
        error.name === 'SequelizeValidationError' ||
        error.name === 'SequelizeUniqueConstraintError'
      ) {
        return res
          .status(400)
          .json({
            error: 'Erreur de validation',
            details: error.errors.map((e: any) => ({
              field: e.path,
              message: e.message,
            })),
          });
      }
      res.status(500).json({ error: error.message });
    }
  },
];

export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await Utilisateur.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    await db.ref(`users/${user.id}`).remove(); // Supprimer de Firebase
    await user.destroy();
    logger.info(`Utilisateur supprimé et synchronisé: ${user.id}`);
    res.status(204).send();
  } catch (error: any) {
    logger.error(
      `Erreur lors de la suppression de l'utilisateur: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsersHandler = async (req: Request, res: Response) => {
  try {
    const users = await Utilisateur.findAll();
    res.status(200).json(users);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la récupération des utilisateurs: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
};

export const assignCamionToDriver = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { camionId } = req.body;

    const user = await Utilisateur.findByPk(userId);
    if (!user) {
      logger.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }
    if (user.role !== 'driver') {
      logger.error(`Utilisateur n'est pas un chauffeur: ${userId}`);
      return res.status(400).json({ error: 'Seul un chauffeur peut être affecté à un camion' });
    }

    const camion = await Camion.findByPk(camionId);
    if (!camion) {
      logger.warn(`Camion non trouvé pour l'ID: ${camionId}`);
      return res.status(404).json({ error: 'Camion non trouvé' });
    }

    // Vérifier si le camion est déjà affecté à un autre chauffeur
    if (camion.driverId && camion.driverId !== user.id) {
      logger.error(`Camion déjà affecté à un autre chauffeur: ${camionId}`);
      return res.status(400).json({ error: 'Ce camion est déjà affecté à un autre chauffeur' });
    }

    // Vérifier si le chauffeur est déjà affecté à un autre camion
    if (user.camionId && user.camionId !== camion.id) {
      logger.error(`Chauffeur déjà affecté à un autre camion: ${userId}`);
      return res.status(400).json({ error: 'Ce chauffeur est déjà affecté à un autre camion' });
    }

    // Affectation
    await user.update({ camionId: camion.id });
    await camion.update({ driverId: user.id });

    // Synchronisation avec Firebase
    await db.ref(`users/${user.id}`).update({
      camionId: camion.id,
      syncStatus: 'pending',
      time: new Date().toISOString(),
    });
    await db.ref(`camions/${camion.id}`).update({
      driverId: user.id,
      syncStatus: 'pending',
      time: new Date().toISOString(),
    });

    logger.info(`Affectation réussie: Chauffeur ${user.id} affecté au camion ${camion.id}`);
    res.status(200).json({ message: 'Affectation réussie', user, camion });
  } catch (error: any) {
    logger.error(`Erreur lors de l'affectation: ${error.message}, Stack: ${error.stack}`);
    res.status(500).json({ error: error.message });
  }
};

export const removeCamionFromDriver = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await Utilisateur.findByPk(userId);
    if (!user) {
      logger.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }
    if (!user.camionId) {
      logger.error(`Chauffeur non affecté à un camion: ${userId}`);
      return res.status(400).json({ error: "Ce chauffeur n'est affecté à aucun camion" });
    }

    const camion = await Camion.findByPk(user.camionId);
    if (!camion) {
      logger.warn(`Camion non trouvé pour l'ID: ${user.camionId}`);
      return res.status(404).json({ error: 'Camion non trouvé' });
    }

    // Suppression de l'affectation
    await user.update({ camionId: null });
    await camion.update({ driverId: null });

    // Synchronisation avec Firebase
    await db.ref(`users/${user.id}`).update({
      camionId: null,
      syncStatus: 'pending',
      time: new Date().toISOString(),
    });
    await db.ref(`camions/${camion.id}`).update({
      driverId: null,
      syncStatus: 'pending',
      time: new Date().toISOString(),
    });

    logger.info(`Affectation supprimée: Chauffeur ${user.id} détaché du camion ${camion.id}`);
    res.status(200).json({ message: 'Affectation supprimée', user, camion });
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression de l'affectation: ${error.message}, Stack: ${error.stack}`);
    res.status(500).json({ error: error.message });
  }
};