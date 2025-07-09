import axios from 'axios';
import type { Facture } from '../types';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getFactures(): Promise<Facture[]> {
  try {
    const response = await api.get('/factures');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des factures');
  }
}

export async function createFacture(facture: Facture, pdfBase64?: string): Promise<Facture> {
  try {
    const response = await api.post('/factures', { ...facture, pdfBase64 });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la création de la facture');
  }
}

export async function getFactureById(id: string): Promise<Facture> {
  try {
    const response = await api.get(`/factures/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement de la facture');
  }
}