import axios from 'axios';
import type { Camion } from '../types';

export interface Chauffeur {
  id: string;
  nom: string;
  email: string;
  role: 'admin' | 'driver';
  password?: string;
  permisNumero?: string;
  permisDelivrance?: Date | null;
  permisExpiration?: Date | null;
  permisLieu?: string;
  permisCategorie?: string;
  camionId?: string;
  camion?: Camion;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Injecte le token JWT à chaque requête si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonctions CRUD Chauffeurs
export const getAllChauffeurs = async (): Promise<Chauffeur[]> => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des chauffeurs.');
  }
};

export const getChauffeurById = async (id: string): Promise<Chauffeur> => {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération du chauffeur.');
  }
};

export const createChauffeur = async (chauffeur: Omit<Chauffeur, 'id'>): Promise<Chauffeur> => {
  try {
    const response = await api.post('/api/users', chauffeur);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.map((e: any) => e.message).join(', ') : errorMessage || 'Erreur lors de la création du chauffeur.');
    }
    throw new Error('Erreur inconnue lors de la création du chauffeur.');
  }
};

export const updateChauffeur = async (id: string, chauffeur: Partial<Chauffeur>): Promise<Chauffeur> => {
  try {
    const response = await api.patch(`/api/users/${id}`, chauffeur);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.map((e: any) => e.message).join(', ') : errorMessage || 'Erreur lors de la mise à jour du chauffeur.');
    }
    throw new Error('Erreur inconnue lors de la mise à jour du chauffeur.');
  }
};

export const deleteChauffeur = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/users/${id}`);
  } catch (error) {
    throw new Error('Erreur lors de la suppression du chauffeur.');
  }
};

// Camions
export const getAllCamions = async (): Promise<Camion[]> => {
  try {
    const response = await api.get('/api/camions');
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des camions.');
  }
};

// Assignation camion
export const assignCamionToChauffeur = async (chauffeurId: string, camionId: string): Promise<Chauffeur> => {
  try {
    const response = await api.put(`/api/users/${chauffeurId}/assign-camion`, { camionId });
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de l\'assignation du camion.');
  }
};

export const unassignCamionFromChauffeur = async (chauffeurId: string): Promise<Chauffeur> => {
  try {
    const response = await api.put(`/api/users/${chauffeurId}/unassign-camion`, {});
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la désassignation du camion.');
  }
};

// Permis expirants
export const getExpiringLicenses = async (days: number = 30): Promise<Chauffeur[]> => {
  try {
    const response = await api.get(`/api/users/expiring-licenses?days=${days}`);
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des permis expirants.');
  }
};