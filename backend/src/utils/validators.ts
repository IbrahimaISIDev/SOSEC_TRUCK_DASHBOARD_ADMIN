export const validateFinancialInput = (
  montant: number,
  sourceOrCategorie: string,
  date: Date
) => {
  if (montant <= 0) throw new Error("Montant doit être positif");
  if (!sourceOrCategorie) throw new Error("Source ou catégorie requise");
  if (!date || isNaN(date.getTime())) throw new Error("Date invalide");
};
