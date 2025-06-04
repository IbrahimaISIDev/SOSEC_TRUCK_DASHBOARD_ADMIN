import { useState, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import ChauffeursList from '../components/ChauffeursList';
import {
  getAllChauffeurs,
  createChauffeur,
  updateChauffeur,
  deleteChauffeur,
} from '../api/userApi';
import { getAllCamions } from '../api/camionApi';
import type { Chauffeur, Camion } from '../types';

// Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Typography color="error">Une erreur s'est produite.</Typography>;
    }
    return this.props.children;
  }
}

export default function Chauffeurs() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [camions, setCamions] = useState<Camion[]>([]);
  const [alertInfo, setAlertInfo] = useState<{
    count: number;
    message: string;
    severity: 'warning' | 'error' | 'success';
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les chauffeurs et camions au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chauffeursData, camionsResponse] = await Promise.all([
          getAllChauffeurs(),
          getAllCamions(),
        ]);

        // Validate chauffeursData
        if (!Array.isArray(chauffeursData)) {
          console.error('getAllChauffeurs did not return an array:', chauffeursData);
          setChauffeurs([]);
        } else {
          setChauffeurs(chauffeursData);
        }

        // Validate camionsResponse
        if (!Array.isArray(camionsResponse.camions)) {
          console.error('getAllCamions did not return an array of camions:', camionsResponse);
          setCamions([]);
        } else {
          setCamions(camionsResponse.camions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlertInfo({
          count: 0,
          message: 'Erreur lors du chargement des données.',
          severity: 'error',
        });
        setChauffeurs([]);
        setCamions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Valider et afficher les alertes pour les permis
  useEffect(() => {
    if (chauffeurs.length === 0) return;

    const validChauffeurs = chauffeurs.filter(
      (chauffeur) => chauffeur.id && chauffeur.nom && chauffeur.email
    );

    const today = new Date();
    let expiredCount = 0;
    let expiringCount = 0;

    validChauffeurs.forEach((chauffeur) => {
      if (chauffeur.permisExpiration) {
        const expDate = new Date(chauffeur.permisExpiration);
        const daysLeft = Math.ceil(
          (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );

        if (daysLeft <= 0) {
          expiredCount++;
        } else if (daysLeft <= 30) {
          expiringCount++;
        }
      }
    });

    if (expiredCount > 0) {
      setAlertInfo({
        count: expiredCount,
        message: `${expiredCount} chauffeur${expiredCount > 1 ? 's ont' : ' a'} un permis expiré`,
        severity: 'error',
      });
    } else if (expiringCount > 0) {
      setAlertInfo({
        count: expiringCount,
        message: `${expiringCount} chauffeur${expiringCount > 1 ? 's ont' : ' a'} un permis qui expire bientôt`,
        severity: 'warning',
      });
    } else {
      setAlertInfo(null);
    }
  }, [chauffeurs]);

  // Ajouter un chauffeur
  const handleAddChauffeur = async (newChauffeur: Omit<Chauffeur, 'id'>) => {
    try {
      if (!newChauffeur.password) {
        setAlertInfo({
          count: 0,
          message: 'Le mot de passe est obligatoire pour la création.',
          severity: 'error',
        });
        return;
      }
      // On retire le champ id s'il existe par erreur
      const { id, ...chauffeurSansId } = newChauffeur as any;
      const createdChauffeur = await createChauffeur(chauffeurSansId);
      setChauffeurs([...chauffeurs, createdChauffeur]);
      setAlertInfo({
        count: 1,
        message: 'Chauffeur ajouté avec succès.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error adding chauffeur:', error);
      setAlertInfo({
        count: 0,
        message: "Erreur lors de l'ajout du chauffeur.",
        severity: 'error',
      });
    }
  };

  // Mettre à jour un chauffeur
  const handleUpdateChauffeur = async (id: string, updatedData: Partial<Chauffeur>) => {
    try {
      // On retire le champ id du body si présent
      const { id: _id, ...dataSansId } = updatedData;
      const updatedChauffeur = await updateChauffeur(id, dataSansId);
      setChauffeurs(
        chauffeurs.map((chauffeur) =>
          chauffeur.id === id ? { ...chauffeur, ...updatedChauffeur } : chauffeur
        )
      );
      setAlertInfo({
        count: 1,
        message: 'Chauffeur mis à jour avec succès.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating chauffeur:', error);
      setAlertInfo({
        count: 0,
        message: 'Erreur lors de la mise à jour du chauffeur.',
        severity: 'error',
      });
    }
  };

  // Supprimer un chauffeur
  const handleDeleteChauffeur = async (id: string) => {
    try {
      await deleteChauffeur(id);
      setChauffeurs(chauffeurs.filter((chauffeur) => chauffeur.id !== id));
      setAlertInfo({
        count: 1,
        message: 'Chauffeur supprimé avec succès.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting chauffeur:', error);
      setAlertInfo({
        count: 0,
        message: 'Erreur lors de la suppression du chauffeur.',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ width: '100%', py: 4 }}>
        <Typography variant="h6">Chargement des données...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ width: '100%', py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Gestion des Chauffeurs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ajoutez, modifiez et suivez vos chauffeurs et leurs informations de permis.
        </Typography>
      </Box>

      {alertInfo && (
        <Alert severity={alertInfo.severity} sx={{ mb: 3 }}>
          {alertInfo.message}
        </Alert>
      )}

      <ErrorBoundary>
        <ChauffeursList
          chauffeurs={chauffeurs.filter(
            (chauffeur) => chauffeur.id && chauffeur.nom && chauffeur.email
          )}
          camions={camions}
          onAdd={handleAddChauffeur}
          onUpdate={handleUpdateChauffeur}
          onDelete={handleDeleteChauffeur}
        />
      </ErrorBoundary>
    </Container>
  );
}