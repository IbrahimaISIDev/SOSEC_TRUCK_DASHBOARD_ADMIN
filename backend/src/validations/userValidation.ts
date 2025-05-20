import { body } from 'express-validator';

export const createUserValidationRules = [
  body('nom')
    .notEmpty()
    .withMessage('Le nom est requis')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
    .custom(async (value) => {
      const { default: Utilisateur } = await import('../models/utilisateur');
      const existingUser = await Utilisateur.findOne({ where: { email: value } });
      if (existingUser) {
        throw new Error('Cet email est déjà utilisé');
      }
    }),
  body('role')
    .isIn(['admin', 'driver'])
    .withMessage('Le rôle doit être "admin" ou "driver"'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('permisNumero')
    .optional()
    .trim()
    .escape(),
  body('permisDelivrance')
    .optional()
    .isISO8601()
    .withMessage('Date de délivrance invalide')
    .toDate(),
  body('permisExpiration')
    .optional()
    .isISO8601()
    .withMessage('Date d\'expiration invalide')
    .toDate(),
  body('permisLieu')
    .optional()
    .trim()
    .escape(),
  body('permisCategorie')
    .optional()
    .trim()
    .escape(),
];

export const updateUserValidationRules = [
  body('nom')
    .optional()
    .notEmpty()
    .withMessage('Le nom est requis')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const { default: Utilisateur } = await import('../models/utilisateur');
      const userId = req.params?.userId ?? '';
      const existingUser = await Utilisateur.findOne({ where: { email: value } });
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Cet email est déjà utilisé');
      }
    }),
  body('role')
    .optional()
    .isIn(['admin', 'driver'])
    .withMessage('Le rôle doit être "admin" ou "driver"'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('permisNumero')
    .optional()
    .trim()
    .escape(),
  body('permisDelivrance')
    .optional()
    .isISO8601()
    .withMessage('Date de délivrance invalide')
    .toDate(),
  body('permisExpiration')
    .optional()
    .isISO8601()
    .withMessage('Date d\'expiration invalide')
    .toDate(),
  body('permisLieu')
    .optional()
    .trim()
    .escape(),
  body('permisCategorie')
    .optional()
    .trim()
    .escape(),
];