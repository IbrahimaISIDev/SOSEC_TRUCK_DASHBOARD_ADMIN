"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFinancialInput = void 0;
const validateFinancialInput = (montant, sourceOrCategorie, date) => {
    if (montant <= 0)
        throw new Error("Montant doit être positif");
    if (!sourceOrCategorie)
        throw new Error("Source ou catégorie requise");
    if (!date || isNaN(date.getTime()))
        throw new Error("Date invalide");
};
exports.validateFinancialInput = validateFinancialInput;
