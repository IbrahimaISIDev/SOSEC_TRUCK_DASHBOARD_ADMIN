import axios from 'axios';
import type { Camion } from '../types';

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

console.log('API Base URL:', import.meta.env.VITE_API_URL);

export const createCamion = async (camion: Partial<Camion>): Promise<Camion> => {
  try {
    const response = await api.post('/api/camions', camion);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.map((e: any) => e.message).join(', ') : errorMessage || 'Erreur lors de la création du camion.');
    }
    throw new Error('Erreur inconnue lors de la création du camion.');
  }
};

export const getCamion = async (id: string): Promise<Camion> => {
  try {
    const response = await api.get(`/api/camions/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la récupération du camion.');
    }
    throw new Error('Erreur inconnue lors de la récupération du camion.');
  }
};

export const getAllCamions = async (page: number = 1, pageSize: number = 10): Promise<{ camions: Camion[]; total: number }> => {
  try {
    const response = await api.get('/api/camions', {
      params: { page, pageSize },
    });
    console.log('getAllCamions response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la récupération des camions.');
    }
    throw new Error('Erreur inconnue lors de la récupération des camions.');
  }
};

export const updateCamion = async (id: string, camion: Partial<Camion>): Promise<Camion> => {
  try {
    const response = await api.patch(`/api/camions/${id}`, camion);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.map((e: any) => e.message).join(', ') : errorMessage || 'Erreur lors de la mise à jour du camion.');
    }
    throw new Error('Erreur inconnue lors de la mise à jour du camion.');
  }
};

export const deleteCamion = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/camions/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la suppression du camion.');
    }
    throw new Error('Erreur inconnue lors de la suppression du camion.');
  }
};