import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MileageList from '../components/MileageList';
import MileageForm from '../components/MileageForm';
import {
  getAllMileages,
  updateMileage,
  createMileage,
  deleteMileage,
} from '../api/mileageApi';
import { getAllChauffeurs } from '../api/userApi';
import { getAllCamions } from '../api/camionApi';
import type { Mileage, Chauffeur, Camion, DecodedToken } from '../types';

const Mileages = () => {
  const [mileages, setMileages] = useState<Mileage[]>([]);
  const [totalMileages, setTotalMileages] = useState(0);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [camions, setCamions] = useState<Camion[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Mileage>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    severity: 'success' | 'error';
  } | null>(null);
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
        const [mileagesResponse, chauffeursData, camionsData] =
          await Promise.all([
            getAllMileages(currentPage + 1, pageSize),
            getAllChauffeurs(),
            getAllCamions(),
          ]);
        console.log('Mileages Response:', mileagesResponse);
        console.log('Chauffeurs Data:', chauffeursData);
        console.log('Camions Data:', camionsData);
        setMileages([...(mileagesResponse.mileages || [])]);
        setTotalMileages(mileagesResponse.total || 0);
        setChauffeurs([
          ...(chauffeursData.filter((c) => c.role === 'driver') || []),
        ]);
        setCamions([...(camionsData.camions || [])]);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch Error:', err);
        setError(err.message || 'Erreur lors du chargement des données.');
        setMileages([]);
        setChauffeurs([]);
        setCamions([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentPage, pageSize]);

  useEffect(() => {
    console.log('Mileages state updated:', mileages);
  }, [mileages]);

  const handleAddMileage = () => {
    setIsEditing(false);
    setFormData({});
    setOpenDialog(true);
  };

  const handleEditMileage = (mileage: Mileage) => {
    setIsEditing(true);
    setFormData({
      id: mileage.id,
      camionId: mileage.camionId,
      driverId: mileage.driverId,
      date: mileage.date,
      distance: mileage.distance,
      imageUrl: mileage.imageUrl,
      syncStatus: mileage.syncStatus,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSubmit = async (data: Partial<Mileage>) => {
    try {
      if (isEditing && formData.id) {
        const updatedMileage = await updateMileage(formData.id, data);
        setMileages((prev) =>
          prev.map((m) => (m.id === updatedMileage.id ? updatedMileage : m))
        );
        setMessage({
          text: 'Kilométrage mis à jour avec succès.',
          severity: 'success',
        });
      } else {
        const newMileage = await createMileage(data);
        setMileages((prev) => [...prev, newMileage]);
        setTotalMileages((prev) => prev + 1);
        setMessage({
          text: 'Kilométrage ajouté avec succès.',
          severity: 'success',
        });
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error('Submit Error:', err);
      setMessage({
        text: err.message || 'Erreur lors de la soumission du kilométrage.',
        severity: 'error',
      });
    }
  };

  const handleDeleteMileage = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce kilométrage ?')) {
      try {
        await deleteMileage(id);
        setMileages((prev) => prev.filter((m) => m.id !== id));
        setTotalMileages((prev) => prev - 1);
        setMessage({
          text: 'Kilométrage supprimé avec succès.',
          severity: 'success',
        });
      } catch (err: any) {
        console.error('Delete Error:', err);
        setMessage({
          text: err.message || 'Erreur lors de la suppression du kilométrage.',
          severity: 'error',
        });
      }
    }
  };

  const handleDownloadDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'distance' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectChange = (
    e: import('@mui/material').SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (field: string, date: Date | null) => {
    setFormData({ ...formData, [field]: date ? date.toISOString() : null });
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  console.log(
    'Rendering Mileages, mileages:',
    mileages,
    'isAdmin:',
    isAdmin,
    'loading:',
    loading,
    'error:',
    error
  );

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!isAdmin) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Accès réservé aux administrateurs.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Kilométrages
      </Typography>
      {message && (
        <Alert
          severity={message.severity}
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      
      <MileageList
        mileages={mileages}
        chauffeurs={chauffeurs}
        camions={camions}
        handleEditMileage={handleEditMileage}
        handleDeleteMileage={handleDeleteMileage}
        handleDownloadDocument={handleDownloadDocument}
        currentPage={currentPage}
        pageSize={pageSize}
        totalMileages={totalMileages}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <MileageForm
        open={openDialog}
        isEditing={isEditing}
        formData={formData}
        chauffeurs={chauffeurs}
        camions={camions}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleDateChange={handleDateChange}
        handleCloseDialog={handleCloseDialog}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};

export default Mileages;
