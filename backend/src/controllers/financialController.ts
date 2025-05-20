import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { createRevenu, createDepense } from '../services/financialService';
import Depense from '../models/depense';
import Document from '../models/document';
import Mileage from '../models/mileage';
import logger from '../utils/logger';

export const createRevenuHandler = async (req: Request, res: Response) => {
  try {
    const { montant, source, date, notes } = req.body;
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    const revenu = await createRevenu(montant, source, new Date(date), notes, adminId);
    res.status(201).json(revenu);
  } catch (error: any) {
    logger.error(`Erreur lors de la création du revenu: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const createDepenseHandler = async (req: Request, res: Response) => {
  try {
    const { id, driverId, type, entryType, date, quantity, amount, description, location, paymentMethod, imageUrl, syncStatus, time } = req.body;
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    const depense = await createDepense(id, driverId, type, entryType, new Date(date), quantity, amount, description, location, paymentMethod, imageUrl, syncStatus, time, adminId);
    res.status(201).json(depense);
  } catch (error: any) {
    logger.error(`Erreur lors de la création de la dépense: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const getDepensesByDateHandler = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const depenses = await Depense.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    res.status(200).json(depenses);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des dépenses: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getAllDepensesHandler = async (req: Request, res: Response) => {
  try {
    const depenses = await Depense.findAll();
    res.status(200).json(depenses);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des dépenses: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getTicketsByDateHandler = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const tickets = await Document.findAll({
      where: {
        dateEntrance: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    res.status(200).json(tickets);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des tickets: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getMileagesByDateHandler = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const mileages = await Mileage.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
    res.status(200).json(mileages);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des mileages: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};