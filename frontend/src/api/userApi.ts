import axios from 'axios';
import type { Camion, Chauffeur } from '../types';

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
    console.log(
      'getAllChauffeurs response:',
      response.data.map((c: Chauffeur) => ({ id: c.id, nom: c.nom }))
    );
    return response.data;
  } catch (error) {
    console.error('getAllChauffeurs error:', error);
    throw new Error('Erreur lors de la récupération des chauffeurs.');
  }
};

export const getChauffeurById = async (id: string): Promise<Chauffeur> => {
  try {
    const response = await api.get(`/api/users/${id}`);
    console.log('getChauffeurById response:', { id, nom: response.data.nom });
    return response.data;
  } catch (error) {
    console.error('getChauffeurById error:', error);
    throw new Error('Erreur lors de la récupération du chauffeur.');
  }
};

export const createChauffeur = async (
  chauffeur: Omit<Chauffeur, 'id'>
): Promise<Chauffeur> => {
  try {
    const response = await api.post('/api/users', chauffeur);
    console.log('createChauffeur response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(
        details
          ? details.map((e: any) => e.message).join(', ')
          : errorMessage || 'Erreur lors de la création du chauffeur.'
      );
    }
    console.error('createChauffeur error:', error);
    throw new Error('Erreur inconnue lors de la création du chauffeur.');
  }
};

export const updateChauffeur = async (
  id: string,
  chauffeur: Partial<Chauffeur>
): Promise<Chauffeur> => {
  try {
    const response = await api.patch(`/api/users/${id}`, chauffeur);
    console.log('updateChauffeur response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(
        details
          ? details.map((e: any) => e.message).join(', ')
          : errorMessage || 'Erreur lors de la mise à jour du chauffeur.'
      );
    }
    console.error('updateChauffeur error:', error);
    throw new Error('Erreur inconnue lors de la mise à jour du chauffeur.');
  }
};

export const deleteChauffeur = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/users/${id}`);
    console.log('deleteChauffeur success:', id);
  } catch (error) {
    console.error('deleteChauffeur error:', error);
    throw new Error('Erreur lors de la suppression du chauffeur.');
  }
};

// Camions
export const getAllCamions = async (): Promise<Camion[]> => {
  try {
    const response = await api.get('/api/camions');
    console.log('getAllCamions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getAllCamions error:', error);
    throw new Error('Erreur lors de la récupération des camions.');
  }
};

// Assignation camion
export const assignCamionToChauffeur = async (
  chauffeurId: string,
  camionId: string
): Promise<Chauffeur> => {
  try {
    const response = await api.put(`/api/users/${chauffeurId}/assign-camion`, {
      camionId,
    });
    console.log('assignCamionToChauffeur response:', response.data);
    return response.data;
  } catch (error) {
    console.error('assignCamionToChauffeur error:', error);
    throw new Error("Erreur lors de l'assignation du camion.");
  }
};

export const unassignCamionFromChauffeur = async (
  chauffeurId: string
): Promise<Chauffeur> => {
  try {
    const response = await api.put(
      `/api/users/${chauffeurId}/unassign-camion`,
      {}
    );
    console.log('unassignCamionFromChauffeur response:', response.data);
    return response.data;
  } catch (error) {
    console.error('unassignCamionFromChauffeur error:', error);
    throw new Error('Erreur lors de la désassignation du camion.');
  }
};

// Permis expirants
export const getExpiringLicenses = async (
  days: number = 30
): Promise<Chauffeur[]> => {
  try {
    const response = await api.get(`/api/users/expiring-licenses?days=${days}`);
    console.log('getExpiringLicenses response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getExpiringLicenses error:', error);
    throw new Error('Erreur lors de la récupération des permis expirants.');
  }
};
