import axios from 'axios';
import type { Mileage } from '../types';

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

export const createMileage = async (mileage: Partial<Mileage>): Promise<Mileage> => {
  try {
    const response = await api.post('/api/mileages', mileage);
    console.log('createMileage response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.join(', ') : errorMessage || 'Erreur lors de la création du kilométrage.');
    }
    throw new Error('Erreur inconnue lors de la création du kilométrage.');
  }
};

export const getMileage = async (id: string): Promise<Mileage> => {
  try {
    const response = await api.get(`/api/mileages/${id}`);
    console.log('getMileage response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la récupération du kilométrage.');
    }
    throw new Error('Erreur inconnue lors de la récupération du kilométrage.');
  }
};

export const getAllMileages = async (
  page: number = 1,
  pageSize: number = 10,
  date?: string
): Promise<{ mileages: Mileage[]; total: number }> => {
  try {
    const response = await api.get('/api/firebase/mileages', {
      params: { page, pageSize, date },
    });
    console.log('getAllMileages raw response:', response.data);
    let mileages: Mileage[] = [];
    let total = 0;
    if (Array.isArray(response.data)) {
      mileages = response.data.map((mileage) => ({
        ...mileage,
        camionId: mileage.truckId || mileage.camionId,
        distance: mileage.kilometer || mileage.distance,
      }));
      total = response.data.length;
    } else if (response.data && Array.isArray(response.data.mileages)) {
      mileages = response.data.mileages.map((mileage: { truckId: any; camionId: any; kilometer: any; distance: any; }) => ({
        ...mileage,
        camionId: mileage.truckId || mileage.camionId,
        distance: mileage.kilometer || mileage.distance,
      }));
      total = Number(response.data.total) || mileages.length;
    }
    console.log('getAllMileages processed response:', { mileages, total });
    return { mileages, total };
  } catch (error) {
    console.error('getAllMileages error:', error);
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la récupération des kilométrages.');
    }
    throw new Error('Erreur inconnue lors de la récupération des kilométrages.');
  }
};

export const updateMileage = async (id: string, mileage: Partial<Mileage>): Promise<Mileage> => {
  try {
    const response = await api.patch(`/api/mileages/${id}`, mileage);
    console.log('updateMileage response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.join(', ') : errorMessage || 'Erreur lors de la mise à jour du kilométrage.');
    }
    throw new Error('Erreur inconnue lors de la mise à jour du kilométrage.');
  }
};

export const deleteMileage = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/mileages/${id}`);
    console.log('deleteMileage success:', id);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la suppression du kilométrage.');
    }
    throw new Error('Erreur inconnue lors de la suppression du kilométrage.');
  }
};