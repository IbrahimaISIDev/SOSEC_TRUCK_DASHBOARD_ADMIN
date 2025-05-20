import { Request, Response } from 'express';
import { syncTickets, syncExpenses, syncMileages, syncUsers, syncCamions } from '../services/syncService';
import logger from '../utils/logger';

export const syncDataHandler = async (req: Request, res: Response) => {
  try {
    await Promise.all([syncTickets(), syncExpenses(), syncMileages(), syncUsers(), syncCamions()]);
    // logger.info('Synchronisation des données en cours...');
    // await Promise.all([syncTickets(), syncExpenses(), syncMileages()]);
    // logger.info('Synchronisation des tickets, dépenses et kilométrages terminée');
    logger.info('Synchronisation des données terminée');
    res.status(200).json({ message: 'Synchronisation terminée' });
  } catch (error: any) {
    logger.error(`Erreur lors de la synchronisation: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};