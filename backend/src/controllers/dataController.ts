import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { db } from '../config/firebase';
import Document from '../models/document';
import Depense from '../models/depense';
import Mileage from '../models/mileage';
import logger from '../utils/logger';

export const getAllDataHandler = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    let whereClause = {};

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      whereClause = {
        date: {
          [Op.between]: [startDate, endDate],
        },
      };
    }

    const [tickets, depenses, mileages] = await Promise.all([
      Document.findAll({ where: whereClause }),
      Depense.findAll({ where: whereClause }),
      Mileage.findAll({ where: whereClause }),
    ]);

    res.status(200).json({
      tickets,
      depenses,
      mileages,
    });
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des données: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getTicketsFromFirebase = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const ticketsRef = db.ref('tickets');
    const snapshot = await ticketsRef.once('value');
    let tickets = snapshot.val() || {};

    if (date) {
      tickets = tickets[date as string] || {};
    }

    const result = [];
    for (const date in tickets) {
      for (const ticketId in tickets[date]) {
        result.push({ id: ticketId, ...tickets[date][ticketId] });
      }
    }

    res.status(200).json(result);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des tickets depuis Firebase: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getExpensesFromFirebase = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const expensesRef = db.ref('expenses');
    const snapshot = await expensesRef.once('value');
    let expenses = snapshot.val() || {};

    if (date) {
      expenses = expenses[date as string] || {};
    }

    const result = [];
    for (const date in expenses) {
      for (const expenseId in expenses[date]) {
        result.push({ id: expenseId, ...expenses[date][expenseId] });
      }
    }

    res.status(200).json(result);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des dépenses depuis Firebase: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getMileagesFromFirebase = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const mileageRef = db.ref('mileage');
    const snapshot = await mileageRef.once('value');
    let mileages = snapshot.val() || {};

    if (date) {
      mileages = mileages[date as string] || {};
    }

    const result = [];
    for (const date in mileages) {
      for (const mileageId in mileages[date]) {
        result.push({ id: mileageId, ...mileages[date][mileageId] });
      }
    }

    res.status(200).json(result);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des mileages depuis Firebase: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
export const getUsersFromFirebase = async (req: Request, res: Response) => {
    try {
        const usersRef = db.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val() || {};
    
        const result = [];
        for (const userId in users) {
        result.push({ id: userId, ...users[userId] });
        }
    
        res.status(200).json(result);
    } catch (error: any) {
        logger.error(`Erreur lors de la récupération des utilisateurs depuis Firebase: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const getCamionsFromFirebase = async (req: Request, res: Response) => {
  try {
    const camionsRef = db.ref('camions');
    const snapshot = await camionsRef.once('value');
    const camions = snapshot.val() || {};

    const result = [];
    for (const camionId in camions) {
      result.push({ id: camionId, ...camions[camionId] });
    }

    res.status(200).json(result);
  } catch (error: any) {
    logger.error(`Erreur lors de la récupération des camions depuis Firebase: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};