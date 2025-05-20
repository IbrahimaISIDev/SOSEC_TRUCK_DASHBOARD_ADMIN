import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/utilisateur';
import logger from '../utils/logger';
import bcrypt from 'bcrypt'; // Ajout pour le hash/match du mot de passe

const JWT_SECRET = process.env.JWT_SECRET || '';

export const loginHandler = async (req: Request, res: Response) => {
  try {
    console.log('Requête reçue pour login:', req.body); // Log
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      console.log('Échec de la validation: email ou mot de passe manquant'); // Log
      return res.status(400).json({ error: 'Les champs email et mot de passe sont requis' });
    }

    // Vérification de l'existence de l'utilisateur
    const user = await Utilisateur.findOne({ where: { email } });
    console.log('Utilisateur trouvé:', user ? user.dataValues : 'Aucun utilisateur'); // Log

    if (!user) {
      console.log('Échec de la vérification: utilisateur non trouvé'); // Log
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérification du mot de passe (si hashé, utilisez bcrypt.compare)
    // Ici, si les mots de passe sont en clair pour les tests :
    // const isPasswordValid = user.password === password;
    // Pour la production, utilisez bcrypt :
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Échec de la vérification: mot de passe incorrect'); // Log
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Sauvegarder le token dans la base de données
    await user.update({ token });

    console.log('Token généré:', token); // Log

    // Réponse avec les informations de l'utilisateur et le token
    res.status(200).json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        permisNumero: user.permisNumero,
        permisDelivrance: user.permisDelivrance?.toISOString() ?? null,
        permisExpiration: user.permisExpiration?.toISOString() ?? null,
        permisLieu: user.permisLieu,
        permisCategorie: user.permisCategorie,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error(`Erreur lors de la connexion: ${error.message}`);
    console.log('Erreur serveur:', error.message); // Log
    res.status(500).json({ error: 'Erreur serveur' });
  }
};