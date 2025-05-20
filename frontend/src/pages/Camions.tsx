import { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, TablePagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CamionsList from '../components/CamionList';
import CamionForm from '../components/CamionForm';
import { getAllCamions, updateCamion, createCamion, deleteCamion } from '../api/camionApi';
import { getAllChauffeurs } from '../api/userApi';
import type { Camion } from '../types';
import type { DecodedToken } from '../types';
import type { Chauffeur } from '../types';

const Camions = () => {
  const [camions, setCamions] = useState<Camion[]>([]);
  const [totalCamions, setTotalCamions] = useState(0);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Camion>>({});
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
    console.log('Token:', token);
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      console.log('Decoded Token:', decoded);
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
        const [camionsResponse, chauffeursData] = await Promise.all([
          getAllCamions(currentPage + 1, pageSize),
          getAllChauffeurs(),
        ]);
        console.log('Camions Response:', JSON.stringify(camionsResponse, null, 2));
        console.log('Chauffeurs Data:', JSON.stringify(chauffeursData, null, 2));
        setCamions(camionsResponse.camions);
        setTotalCamions(camionsResponse.total);
        setChauffeurs(chauffeursData.filter(c => c.role === 'driver'));
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch Error:', err);
        setError(err.response?.data?.error || err.message || 'Erreur lors du chargement des données.');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentPage, pageSize]);

  const handleAddCamion = () => {
    setIsEditing(false);
    setFormData({});
    setOpenDialog(true);
  };

  const handleEditCamion = (camion: Camion) => {
    setIsEditing(true);
    setFormData({
      id: camion.id,
      nom: camion.nom,
      type: camion.type,
      immatriculation: camion.immatriculation,
      assuranceDetails: camion.assuranceDetails,
      assuranceExpiration: camion.assuranceExpiration,
      driverId: camion.driverId,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSubmit = async (data: Partial<Camion>) => {
    try {
      console.log('Submitting Camion Data:', data);
      if (isEditing && formData.id) {
        const updatedCamion = await updateCamion(formData.id, data);
        setCamions(camions.map(c => (c.id === updatedCamion.id ? updatedCamion : c)));
        setMessage({ text: 'Camion mis à jour avec succès.', severity: 'success' });
      } else {
        const newCamion = await createCamion(data);
        setCamions([...camions, newCamion]);
        setTotalCamions(totalCamions + 1);
        setMessage({ text: 'Camion ajouté avec succès.', severity: 'success' });
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error('Submit Error:', err);
      setMessage({ text: err.message || 'Erreur lors de la soumission du camion.', severity: 'error' });
    }
  };

  const handleDeleteCamion = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce camion ?')) {
      try {
        await deleteCamion(id);
        setCamions(camions.filter(c => c.id !== id));
        setTotalCamions(totalCamions - 1);
        setMessage({ text: 'Camion supprimé avec succès.', severity: 'success' });
      } catch (err: any) {
        setMessage({ text: err.message || 'Erreur lors de la suppression du camion.', severity: 'error' });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: import('@mui/material').SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (field: string, date: Date | null) => {
    setFormData({ ...formData, [field]: date ? date.toISOString() : null });
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

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
        Gestion des Camions
      </Typography>
      {message && (
        <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddCamion}
        sx={{ mb: 2 }}
      >
        Ajouter un camion
      </Button>
      <CamionsList
        camions={camions}
        chauffeurs={chauffeurs}
        handleEditCamion={handleEditCamion}
        handleDeleteCamion={handleDeleteCamion}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCamions={totalCamions}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <CamionForm
        open={openDialog}
        isEditing={isEditing}
        formData={formData}
        chauffeurs={chauffeurs}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleDateChange={handleDateChange}
        handleCloseDialog={handleCloseDialog}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};

export default Camions;