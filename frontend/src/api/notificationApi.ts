import axios from 'axios';
import type { Notification } from '../types';

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

export const getAllNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/api/notifications');
  return response.data;
};