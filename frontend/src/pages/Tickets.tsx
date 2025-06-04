import { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import TicketsList from '../components/TicketsList';
import TicketDetailsDialog from '../components/TicketDetailsDialog';
import { getAllTickets, updateTicket, createTicket, deleteTicket } from '../api/ticketApi';
import { getAllChauffeurs } from '../api/userApi';
import { getAllCamions } from '../api/camionApi';
import type { Ticket, Chauffeur, Camion, DecodedToken } from '../types';

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [camions, setCamions] = useState<Camion[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Ticket>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.role !== 'admin') {
        setError('Accès réservé aux administrateurs.');
        setLoading(false);
        return;
      }
      setIsAdmin(true);
    } catch (err) {
      console.error('Token Decoding Error:', err);
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [ticketsResponse, chauffeursData, camionsData] = await Promise.all([
          getAllTickets(currentPage + 1, pageSize),
          getAllChauffeurs(),
          getAllCamions(),
        ]);
        console.log('Tickets Response:', ticketsResponse);
        console.log('Chauffeurs Data:', chauffeursData);
        console.log('Camions Data:', camionsData);
        setTickets([...(ticketsResponse.tickets || [])]);
        setTotalTickets(ticketsResponse.total || 0);
        setChauffeurs([...(chauffeursData.filter((c) => c.role === 'driver') || [])]);
        setCamions([...(camionsData.camions || [])]);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch Error:', err);
        setError(err.message || 'Erreur lors du chargement des données.');
        setTickets([]);
        setChauffeurs([]);
        setCamions([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentPage, pageSize]);

  useEffect(() => {
    console.log('Tickets state updated:', tickets);
  }, [tickets]);

  const handleAddTicket = () => {
    setIsEditing(false);
    setFormData({});
    setOpenDialog(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setIsEditing(true);
    setFormData({
      id: ticket.id,
      type: ticket.type,
      ticketNum: ticket.ticketNum,
      dateEntrance: ticket.dateEntrance,
      dateExit: ticket.dateExit,
      camionId: ticket.camionId,
      product: ticket.product,
      netWeight: ticket.netWeight,
      driver: ticket.driver,
      imageUrl: ticket.imageUrl,
      syncStatus: ticket.syncStatus,
      extraData: ticket.extraData,
      time: ticket.time,
    });
    setOpenDialog(true);
  };

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDetails = () => {
    setSelectedTicket(null);
  };

  const handleDeleteTicket = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      try {
        await deleteTicket(id);
        setTickets((prev) => prev.filter((t) => t.id !== id));
        setTotalTickets((prev) => prev - 1);
        setMessage({ text: 'Ticket supprimé avec succès.', severity: 'success' });
      } catch (err: any) {
        console.error('Delete Error:', err);
        setMessage({ text: err.message || 'Erreur lors de la suppression du ticket.', severity: 'error' });
      }
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  console.log('Rendering Tickets, tickets:', tickets, 'isAdmin:', isAdmin, 'loading:', loading, 'error:', error);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!isAdmin) {
    return <Alert severity="error" sx={{ m: 2 }}>Accès réservé aux administrateurs.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Tickets
      </Typography>
      {message && (
        <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}
      <TicketsList
        tickets={tickets}
        chauffeurs={chauffeurs}
        camions={camions}
        handleEditTicket={handleEditTicket}
        handleDeleteTicket={handleDeleteTicket}
        handleViewDetails={handleViewDetails}
        currentPage={currentPage}
        pageSize={pageSize}
        totalTickets={totalTickets}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <TicketDetailsDialog
        open={!!selectedTicket}
        ticket={selectedTicket}
        chauffeurs={chauffeurs}
        camions={camions}
        onClose={handleCloseDetails}
      />
    </Box>
  );
};

export default Tickets;