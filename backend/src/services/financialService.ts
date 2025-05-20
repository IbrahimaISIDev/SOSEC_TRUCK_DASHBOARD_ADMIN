import Depense from '../models/depense';
import logger from '../utils/logger';

export const createRevenu = async (
  montant: number,
  source: string,
  date: Date,
  notes: string,
  adminId: string
) => {
  // Simuler la création d'un revenu (vous pouvez ajouter un modèle Revenu si nécessaire)
  const revenu = { id: `revenu_${Date.now()}`, montant, source, date, notes, adminId };
  logger.info(`Revenu créé: ${revenu.id}`);
  return revenu;
};

export const createDepense = async (
  id: string,
  driverId: string,
  type: string,
  entryType: string,
  date: Date,
  quantity: number,
  amount: number,
  description: string,
  location: string,
  paymentMethod: string,
  imageUrl: string | null,
  syncStatus: string,
  time: string,
  adminId: string
) => {
  const depense = await Depense.create({
    id,
    driverId,
    type,
    entryType,
    date,
    quantity,
    amount,
    description,
    location,
    paymentMethod,
    imageUrl,
    syncStatus,
    time,
    createdBy: adminId,
  });
  return depense;
};