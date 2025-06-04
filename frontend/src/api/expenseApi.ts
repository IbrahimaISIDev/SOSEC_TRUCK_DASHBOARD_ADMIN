import axios from 'axios';
import type { Expense } from '../types';
import { getChauffeurById } from './userApi';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getExpense = async (id: string): Promise<Expense> => {
  try {
    const response = await api.get(`/api/expenses/${id}`);
    console.log('getExpense response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(
        errorMessage || 'Erreur lors de la récupération de la dépense.'
      );
    }
    throw new Error('Erreur inconnue lors de la récupération de la dépense.');
  }
};

export const getAllExpenses = async (
  page: number = 1,
  pageSize: number = 10,
  date?: string
): Promise<{ expenses: Expense[]; total: number }> => {
  try {
    const response = await api.get('/api/firebase/expenses', {
      params: { page, pageSize, date },
    });
    console.log('getAllExpenses raw response:', response.data);
    let expenses: Expense[] = [];
    let total = 0;
    if (Array.isArray(response.data)) {
      expenses = await Promise.all(
        response.data.map(async (expense) => {
          let driverName = 'Non assigné';
          const driverId =
            expense.driver_id || expense.driver || expense.driverId || null;
          if (driverId) {
            try {
              const chauffeur = await getChauffeurById(driverId);
              driverName = chauffeur.nom || 'Nom non disponible';
              console.log(
                `getChauffeurById success for driverId ${driverId}:`,
                { nom: chauffeur.nom }
              );
            } catch (err) {
              console.error(
                `Erreur lors de la récupération du chauffeur ${driverId}:`,
                err
              );
            }
          }
          return {
            ...expense,
            driverId,
            driverName,
            paymentMethod: expense.payment_method || expense.paymentMethod || 'N/A',
            syncStatus: expense.sync_status || expense.syncStatus || 'N/A',
          };
        })
      );
      total = response.data.length;
    } else if (response.data && Array.isArray(response.data.expenses)) {
      expenses = await Promise.all(
        response.data.expenses.map(async (expense: any) => {
          let driverName = 'Non assigné';
          const driverId =
            expense.driver_id || expense.driver || expense.driverId || null;
          if (driverId) {
            try {
              const chauffeur = await getChauffeurById(driverId);
              driverName = chauffeur.nom || 'Nom non disponible';
              console.log(
                `getChauffeurById success for driverId ${driverId}:`,
                { nom: chauffeur.nom }
              );
            } catch (err) {
              console.error(
                `Erreur lors de la récupération du chauffeur ${driverId}:`,
                err
              );
            }
          }
          return {
            ...expense,
            driverId,
            driverName,
            paymentMethod: expense.payment_method || expense.paymentMethod || 'N/A',
            syncStatus: expense.sync_status || expense.syncStatus || 'N/A',
          };
        })
      );
      total = Number(response.data.total) || expenses.length;
    }
    console.log('getAllExpenses processed response:', {
      expenses: expenses.map((e) => ({
        id: e.id,
        driverId: e.driverId,
        driverName: e.driverName,
        paymentMethod: e.paymentMethod,
        syncStatus: e.syncStatus,
      })),
      total,
    });
    return { expenses, total };
  } catch (error) {
    console.error('getAllExpenses error:', error);
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(
        errorMessage || 'Erreur lors de la récupération des dépenses.'
      );
    }
    throw new Error('Erreur inconnue lors de la récupération des dépenses.');
  }
};

export const updateExpense = async (
  id: string,
  expense: Partial<Expense>
): Promise<Expense> => {
  try {
    const response = await api.patch(`/api/expenses/${id}`, expense);
    console.log('updateExpense response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(
        details
          ? details.join(', ')
          : errorMessage || 'Erreur lors de la mise à jour de la dépense.'
      );
    }
    throw new Error('Erreur inconnue lors de la mise à jour de la dépense.');
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/expenses/${id}`);
    console.log('deleteExpense success:', id);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(
        errorMessage || 'Erreur lors de la suppression de la dépense.'
      );
    }
    throw new Error('Erreur inconnue lors de la suppression de la dépense.');
  }
};