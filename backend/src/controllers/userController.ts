import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Utilisateur from '../models/utilisateur';
import Camion from '../models/camion';
import logger from '../utils/logger';
const sequelize = require('../config/db'); // Fix: Added sequelize import
const { db } = require('../config/firebase');
import { getAuth } from 'firebase-admin/auth';
import { Op } from 'sequelize';

const JWT_SECRET = process.env.JWT_SECRET || '';

export const createUserHandler = [
  ...require('../validations/userValidation').createUserValidationRules,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      return res.status(400).json({ error: 'Erreur de validation', details: errors.array() });
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
        telephone,
        adresse,
      } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Le mot de passe est requis pour créer un utilisateur.' });
      }

      const result = await sequelize.transaction(async (t: any) => {
        // Create user in Firebase Authentication
        const auth = getAuth();
        const userRecord = await auth.createUser({ email, password });
        const firebaseUid = userRecord.uid;

        let validatedCamionId: string | null = null;
        if (camionId) {
          const camion = await Camion.findByPk(camionId, { transaction: t });
          if (!camion) {
            logger.error(`Camion non trouvé pour camionId: ${camionId}`);
            throw new Error('Camion non trouvé');
          }
          if (camion.driverId) {
            logger.error(`Camion déjà assigné à un autre chauffeur: ${camionId}`);
            throw new Error('Ce camion est déjà assigné à un autre chauffeur');
          }
          const existingUser = await Utilisateur.findOne({
            where: { camionId },
            transaction: t,
          });
          if (existingUser) {
            logger.error(`camionId déjà assigné à un autre utilisateur: ${camionId}`);
            throw new Error('Ce camion est déjà assigné à un autre utilisateur');
          }
          validatedCamionId = camionId;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user in Sequelize
        const user = await Utilisateur.create(
          {
            id: firebaseUid,
            nom,
            email,
            role,
            password: hashedPassword,
            permisNumero,
            permisDelivrance: permisDelivrance ? new Date(permisDelivrance) : null,
            permisExpiration: permisExpiration ? new Date(permisExpiration) : null,
            permisLieu,
            permisCategorie,
            camionId: validatedCamionId,
            telephone,
            adresse,
            syncStatus: 'synced',
            time: new Date().toISOString(),
          },
          { transaction: t }
        );

        if (validatedCamionId) {
          await Camion.update(
            { driverId: firebaseUid },
            { where: { id: validatedCamionId }, transaction: t }
          );
        }

        // Generate JWT
        const token = jwt.sign(
          { id: firebaseUid, role: user.role, email: user.email },
          JWT_SECRET,
          { expiresIn: '2h' }
        );
        await user.update({ token }, { transaction: t });

        // Sync with Firebase Realtime Database
        await db.ref(`users/${firebaseUid}`).set({
          id: firebaseUid,
          nom: user.nom,
          email: user.email,
          role: user.role,
          permisNumero: user.permisNumero,
          permisDelivrance: user.permisDelivrance?.toISOString() || null,
          permisExpiration: user.permisExpiration?.toISOString() || null,
          permisLieu: user.permisLieu,
          permisCategorie: user.permisCategorie,
          camionId: user.camionId || null,
          telephone: user.telephone || null,
          adresse: user.adresse || null,
          syncStatus: user.syncStatus,
          time: user.time,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        });

        if (validatedCamionId) {
          await db.ref(`camions/${validatedCamionId}`).update({
            driverId: firebaseUid,
            syncStatus: 'synced',
            time: new Date().toISOString(),
          });
        }

        return { user, token };
      });

      logger.info(`Utilisateur créé et synchronisé avec UID: ${result.user.id}`);
      res.status(201).json({
        id: result.user.id,
        nom: result.user.nom,
        email: result.user.email,
        role: result.user.role,
        permisNumero: result.user.permisNumero,
        permisDelivrance: result.user.permisDelivrance?.toISOString() || null,
        permisExpiration: result.user.permisExpiration?.toISOString() || null,
        permisLieu: result.user.permisLieu,
        permisCategorie: result.user.permisCategorie,
        camionId: result.user.camionId,
        token: result.token,
        syncStatus: result.user.syncStatus,
        time: result.user.time,
        createdAt: result.user.createdAt.toISOString(),
        updatedAt: result.user.updatedAt.toISOString(),
      });
    } catch (error: any) {
      logger.error(`Erreur lors de la création de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
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
    res.status(200).json({
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
      syncStatus: user.syncStatus,
      time: user.time,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: error.message });
  }
};

export const updateUserHandler = [
  ...require('../validations/userValidation').updateUserValidationRules,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors:', errors.array());
      return res.status(400).json({ error: 'Erreur de validation', details: errors.array() });
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
        telephone,
        adresse,
      } = req.body;

      const result = await sequelize.transaction(async (t: any) => {
        const user = await Utilisateur.findByPk(userId, { transaction: t });
        if (!user) {
          logger.warn(`Utilisateur non trouvé pour ID: ${userId}`);
          throw new Error('Utilisateur non trouvé.');
        }

        let validatedCamionId: string | null = null;
        if (camionId) {
          const camion = await Camion.findByPk(camionId, { transaction: t });
          if (!camion) {
            logger.error(`Camion non trouvé pour camionId: ${camionId}`);
            throw new Error('Camion non trouvé');
          }
          if (camion.driverId && camion.driverId !== user.id) {
            logger.error(`Camion déjà assigné à un autre chauffeur: ${camionId}`);
            throw new Error('Ce camion est déjà assigné à un autre chauffeur');
          }
          const existingUser = await Utilisateur.findOne({
            where: { camionId, id: { [Op.ne]: user.id } },
            transaction: t,
          });
          if (existingUser) {
            logger.error(`camionId déjà assigné à un autre utilisateur: ${camionId}`);
            throw new Error('Ce camion est déjà assigné à un autre utilisateur');
          }
          validatedCamionId = camionId;
        }

        const updateData: any = {
          nom,
          email,
          role,
          permisNumero,
          permisDelivrance: permisDelivrance ? new Date(permisDelivrance) : null,
          permisExpiration: permisExpiration ? new Date(permisExpiration) : null,
          permisLieu,
          permisCategorie,
          camionId: validatedCamionId,
          syncStatus: 'synced',
          time: new Date().toISOString(),
        };

        if (password) {
          const saltRounds = 10;
          updateData.password = await bcrypt.hash(password, saltRounds);
        }

        // Handle truck unassignment
        if (user.camionId && user.camionId !== validatedCamionId) {
          await Camion.update(
            { driverId: null },
            { where: { id: user.camionId }, transaction: t }
          );
          await db.ref(`camions/${user.camionId}`).update({
            driverId: null,
            syncStatus: 'synced',
            time: new Date().toISOString(),
          });
        }

        // Handle truck assignment
        if (validatedCamionId && validatedCamionId !== user.camionId) {
          await Camion.update(
            { driverId: user.id },
            { where: { id: validatedCamionId }, transaction: t }
          );
          await db.ref(`camions/${validatedCamionId}`).update({
            driverId: user.id,
            syncStatus: 'synced',
            time: new Date().toISOString(),
          });
        }

        await user.update(updateData, { transaction: t });

        // Sync with Firebase
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
          camionId: user.camionId || null,
          syncStatus: user.syncStatus,
          time: user.time,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        });

        return user;
      });

      logger.info(`Utilisateur mis à jour et synchronisé: ${result.id}`);
      res.status(200).json({
        id: result.id,
        nom: result.nom,
        email: result.email,
        role: result.role,
        permisNumero: result.permisNumero,
        permisDelivrance: result.permisDelivrance?.toISOString() || null,
        permisExpiration: result.permisExpiration?.toISOString() || null,
        permisLieu: result.permisLieu,
        permisCategorie: result.permisCategorie,
        camionId: result.camionId,
        syncStatus: result.syncStatus,
        time: result.time,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      });
    } catch (error: any) {
      logger.error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
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
  },
];

export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await sequelize.transaction(async (t: any) => {
      const user = await Utilisateur.findByPk(userId, { transaction: t });
      if (!user) {
        logger.warn(`Utilisateur non trouvé pour ID: ${userId}`);
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Unassign truck if assigned
      if (user.camionId) {
        await Camion.update(
          { driverId: null },
          { where: { id: user.camionId }, transaction: t }
        );
        await db.ref(`camions/${user.camionId}`).update({
          driverId: null,
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      await db.ref(`users/${user.id}`).remove();
      await user.destroy({ transaction: t });

      return true;
    });

    logger.info(`Utilisateur supprimé et synchronisé: ${userId}`);
    res.status(204).send();
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression de l'utilisateur: ${error.message}, Stack: ${error.stack}`);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsersHandler = async (req: Request, res: Response) => {
  try {
    const users = await Utilisateur.findAll();
    res.status(200).json(users.map(user => ({
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
      syncStatus: user.syncStatus,
      time: user.time,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })));
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des utilisateurs: ${error.message}, Stack: ${error.stack}`);
    res.status(500).json({ error: error.message });
  }
};

export const assignCamionToDriver = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { camionId } = req.body;

    const result = await sequelize.transaction(async (t: any) => {
      const user = await Utilisateur.findByPk(userId, { transaction: t });
      if (!user) {
        logger.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
        throw new Error('Chauffeur non trouvé');
      }
      if (user.role !== 'driver') {
        logger.error(`Utilisateur n'est pas un chauffeur: ${userId}`);
        throw new Error('Seul un chauffeur peut être affecté à un camion');
      }

      const camion = await Camion.findByPk(camionId, { transaction: t });
      if (!camion) {
        logger.warn(`Camion non trouvé pour l'ID: ${camionId}`);
        throw new Error('Camion non trouvé');
      }

      if (camion.driverId && camion.driverId !== user.id) {
        logger.error(`Camion déjà affecté à un autre chauffeur: ${camionId}`);
        throw new Error('Ce camion est déjà affecté à un autre chauffeur');
      }

      if (user.camionId && user.camionId !== camion.id) {
        logger.error(`Chauffeur déjà affecté à un autre camion: ${userId}`);
        throw new Error('Ce chauffeur est déjà affecté à un autre camion');
      }

      // Unassign previous driver if necessary
      if (camion.driverId && camion.driverId !== user.id) {
        await Utilisateur.update(
          { camionId: null },
          { where: { id: camion.driverId }, transaction: t }
        );
        await db.ref(`users/${camion.driverId}`).update({
          camionId: null,
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      // Unassign previous truck if necessary
      if (user.camionId && user.camionId !== camion.id) {
        await Camion.update(
          { driverId: null },
          { where: { id: user.camionId }, transaction: t }
        );
        await db.ref(`camions/${user.camionId}`).update({
          driverId: null,
          syncStatus: 'synced',
          time: new Date().toISOString(),
        });
      }

      // Assign truck to driver
      await user.update({ camionId: camion.id }, { transaction: t });
      await camion.update({ driverId: user.id }, { transaction: t });

      // Sync with Firebase
      await db.ref(`users/${user.id}`).update({
        camionId: camion.id,
        syncStatus: 'synced',
        time: new Date().toISOString(),
      });
      await db.ref(`camions/${camion.id}`).update({
        driverId: user.id,
        syncStatus: 'synced',
        time: new Date().toISOString(),
      });

      return { user, camion };
    });

    logger.info(`Affectation réussie: Chauffeur ${result.user.id} affecté au camion ${result.camion.id}`);
    res.status(200).json({
      message: 'Affectation réussie',
      user: {
        id: result.user.id,
        nom: result.user.nom,
        email: result.user.email,
        role: result.user.role,
        camionId: result.user.camionId,
      },
      camion: {
        id: result.camion.id,
        nom: result.camion.nom,
        immatriculation: result.camion.immatriculation,
        driverId: result.camion.driverId,
      },
    });
  } catch (error: any) {
    logger.error(`Erreur lors de l'affectation: ${error.message}, Stack: ${error.stack}`);
    res.status(400).json({ error: error.message });
  }
};

export const removeCamionFromDriver = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await sequelize.transaction(async (t: any) => {
      const user = await Utilisateur.findByPk(userId, { transaction: t });
      if (!user) {
        logger.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
        throw new Error('Chauffeur non trouvé');
      }
      if (!user.camionId) {
        logger.error(`Chauffeur non affecté à un camion: ${userId}`);
        throw new Error("Ce chauffeur n'est affecté à aucun camion");
      }

      const camion = await Camion.findByPk(user.camionId, { transaction: t });
      if (!camion) {
        logger.warn(`Camion non trouvé pour l'ID: ${user.camionId}`);
        throw new Error('Camion non trouvé');
      }

      // Remove assignment
      await user.update({ camionId: null }, { transaction: t });
      await camion.update({ driverId: null }, { transaction: t });

      // Sync with Firebase
      await db.ref(`users/${user.id}`).update({
        camionId: null,
        syncStatus: 'synced',
        time: new Date().toISOString(),
      });
      await db.ref(`camions/${camion.id}`).update({
        driverId: null,
        syncStatus: 'synced',
        time: new Date().toISOString(),
      });

      return { user, camion };
    });

    logger.info(`Affectation supprimée: Chauffeur ${result.user.id} détaché du camion ${result.camion.id}`);
    res.status(200).json({
      message: 'Affectation supprimée',
      user: {
        id: result.user.id,
        nom: result.user.nom,
        email: result.user.email,
        role: result.user.role,
        camionId: result.user.camionId,
      },
      camion: {
        id: result.camion.id,
        nom: result.camion.nom,
        immatriculation: result.camion.immatriculation,
        driverId: result.camion.driverId,
      },
    });
  } catch (error: any) {
    logger.error(`Erreur lors de la suppression de l'affectation: ${error.message}, Stack: ${error.stack}`);
    res.status(400).json({ error: error.message });
  }
};

export const getDriverCamion = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await Utilisateur.findByPk(userId, {
      include: [{ model: Camion, as: 'camion' }],
    });
    if (!user) {
      logger.warn(`Chauffeur non trouvé pour l'ID: ${userId}`);
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }
    if (user.role !== 'driver') {
      logger.error(`Utilisateur n'est pas un chauffeur: ${userId}`);
      return res
        .status(400)
        .json({ error: 'Seul un chauffeur peut avoir un camion associé' });
    }
    res.status(200).json(user.camionId);
  } catch (error: any) {
    logger.error(
      `Erreur lors de la récupération du camion du chauffeur: ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({ error: error.message });
  }
};