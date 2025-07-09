import { Request, Response } from 'express';
import Facture from '../models/facture';
import cloudinary from '../config/cloudinary';

// Validate invoice data
const validateFacture = (data: any) => {
  const errors: string[] = [];
  if (!data.numero) errors.push('Numéro de facture requis');
  if (!data.date) errors.push('Date requise');
  if (!data.clientNom) errors.push('Nom du client requis');
  if (!data.clientAdresse) errors.push('Adresse du client requise');
  if (!data.societeNom) errors.push('Nom de la société requis');
  if (!data.societeAdresse) errors.push('Adresse de la société requise');
  if (!Array.isArray(data.lignes) || data.lignes.length === 0) errors.push('Au moins une ligne de facture requise');
  if (typeof data.totalHT !== 'number') errors.push('Total HT requis');
  if (typeof data.tva !== 'number') errors.push('TVA requise');
  if (typeof data.totalTTC !== 'number') errors.push('Total TTC requis');

  // Validate line items
  data.lignes.forEach((ligne: any, index: number) => {
    if (!ligne.designation) errors.push(`Ligne ${index + 1}: Désignation requise`);
    if (typeof ligne.quantite !== 'number' || ligne.quantite <= 0) errors.push(`Ligne ${index + 1}: Quantité invalide`);
    if (typeof ligne.prixUnitaire !== 'number' || ligne.prixUnitaire < 0) errors.push(`Ligne ${index + 1}: Prix unitaire invalide`);
    if (typeof ligne.totalLigne !== 'number' || ligne.totalLigne !== ligne.quantite * ligne.prixUnitaire) {
      errors.push(`Ligne ${index + 1}: Total ligne incorrect`);
    }
  });

  // Validate totals
  const calculatedTotalHT = data.lignes.reduce((sum: number, ligne: any) => sum + ligne.totalLigne, 0);
  if (calculatedTotalHT !== data.totalHT) errors.push('Total HT incohérent avec les lignes');
  if (data.totalTTC !== data.totalHT * (1 + data.tva / 100)) errors.push('Total TTC incohérent avec HT et TVA');

  return errors;
};

export const createFacture = async (req: Request, res: Response) => {
  try {
    const errors = validateFacture(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { pdfBase64, ...factureData } = req.body;

    let pdfUrl = null;
    if (pdfBase64) {
      // Upload PDF to Cloudinary
      const result = await cloudinary.uploader.upload(`data:application/pdf;base64,${pdfBase64}`, {
        resource_type: 'raw',
        folder: 'invoices',
        public_id: `facture_${factureData.numero}_${Date.now()}`,
      });
      pdfUrl = result.secure_url;
    }

    const facture = await Facture.create({ ...factureData, pdfUrl });
    res.status(201).json(facture);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Le numéro de facture existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur serveur lors de la création de la facture', details: error.message });
    }
  }
};

export const getFactures = async (req: Request, res: Response) => {
  try {
    const factures = await Facture.findAll();
    res.status(200).json(factures);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des factures', details: error.message });
  }
};

export const getFactureById = async (req: Request, res: Response) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    res.status(200).json(facture);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la facture', details: error.message });
  }
};