import axios from 'axios';
import type { Ticket } from '../types';

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

export const createTicket = async (ticket: Partial<Ticket>): Promise<Ticket> => {
  try {
    const response = await api.post('/api/tickets', ticket);
    console.log('createTicket response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.join(', ') : errorMessage || 'Erreur lors de la création du ticket.');
    }
    throw new Error('Erreur inconnue lors de la création du ticket.');
  }
};

export const getTicket = async (id: string): Promise<Ticket> => {
  try {
    const response = await api.get(`/api/tickets/${id}`);
    console.log('getTicket response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la récupération du ticket.');
    }
    throw new Error('Erreur inconnue lors de la récupération du ticket.');
  }
};

export const getAllTickets = async (
  page: number = 1,
  pageSize: number = 10,
  date?: string
): Promise<{ tickets: Ticket[]; total: number }> => {
  try {
    const response = await api.get('/api/firebase/tickets', {
      params: { page, pageSize, date },
    });
    console.log('getAllTickets raw response:', response.data);
    let tickets: Ticket[] = [];
    let total = 0;
    if (Array.isArray(response.data)) {
      tickets = response.data.map((ticket) => ({
        ...ticket,
        camionId: ticket.truckId || ticket.camionId,
        driverId: ticket.driver || ticket.driverId,
      }));
      total = response.data.length;
    } else if (response.data && Array.isArray(response.data.tickets)) {
      tickets = response.data.tickets.map((ticket: { truckId: any; camionId: any; driver: any; driverId: any; }) => ({
        ...ticket,
        camionId: ticket.truckId || ticket.camionId,
        driverId: ticket.driver || ticket.driverId,
      }));
      total = Number(response.data.total) || tickets.length;
    }
    console.log('getAllTickets processed response:', { tickets, total });
    return { tickets, total };
  } catch (error) {
    console.error('getAllTickets error:', error);
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la récupération des tickets.');
    }
    throw new Error('Erreur inconnue lors de la récupération des tickets.');
  }
};

export const updateTicket = async (id: string, ticket: Partial<Ticket>): Promise<Ticket> => {
  try {
    const response = await api.patch(`/api/tickets/${id}`, ticket);
    console.log('updateTicket response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage, details } = error.response.data;
      throw new Error(details ? details.join(', ') : errorMessage || 'Erreur lors de la mise à jour du ticket.');
    }
    throw new Error('Erreur inconnue lors de la mise à jour du ticket.');
  }
};

export const deleteTicket = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/tickets/${id}`);
    console.log('deleteTicket success:', id);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { error: errorMessage } = error.response.data;
      throw new Error(errorMessage || 'Erreur lors de la suppression du ticket.');
    }
    throw new Error('Erreur inconnue lors de la suppression du ticket.');
  }
};

// export const uploadImage = async (file: File): Promise<string> => {
//   const formData = new FormData();
//   formData.append('file', file);

//   try {
//     const response = await api.post('/api/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data.imageUrl;
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response) {
//       const { error: errorMessage } = error.response.data;
//       throw new Error(errorMessage || 'Erreur lors de l\'upload de l\'image.');
//     }
//     throw new Error('Erreur inconnue lors de l\'upload de l\'image.');
//   }
// };
// export const getTicketByDate = async (date: string): Promise<Ticket[]> => {
//   try {
//     const response = await api.get('/api/tickets', {
//       params: { date },
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response) {
//       const { error: errorMessage } = error.response.data;
//       throw new Error(errorMessage || 'Erreur lors de la récupération des tickets par date.');
//     }
//     throw new Error('Erreur inconnue lors de la récupération des tickets par date.');
//   }
// }