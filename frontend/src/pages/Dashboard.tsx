import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllNotifications } from '../api/notificationApi';
import type { Notification } from '../types';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Stack,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { Link as RouterLink } from 'react-router-dom';

// Interface pour les données du tableau de bord
interface DashboardData {
  financialData: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  } | null;
  recentDocuments: {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
  }[];
  driverActivities: {
    id: string;
    driver: string;
    ticket: string;
    date: string;
  }[];
  revenueExpenseData: { month: string; revenue: number; expense: number }[];
  documentStatusData: { label: string; value: number; color: string }[];
}

// Données statiques (à remplacer par API)
const staticDashboardData: DashboardData = {
  financialData: {
    totalRevenue: 125000,
    totalExpenses: 75000,
    netProfit: 50000,
  },
  recentDocuments: [
    {
      id: '1',
      name: 'Permis de conduire',
      type: 'License',
      dateAdded: '2025-05-01',
    },
    { id: '2', name: 'Assurance', type: 'Insurance', dateAdded: '2025-04-28' },
    {
      id: '3',
      name: 'Ticket #250395',
      type: 'Ticket',
      dateAdded: '2025-04-25',
    },
  ],
  driverActivities: [
    { id: '1', driver: 'Jean Dupont', ticket: '250395', date: '2025-05-10' },
    { id: '2', driver: 'Marie Sow', ticket: '250396', date: '2025-05-09' },
  ],
  revenueExpenseData: [
    { month: 'Jan', revenue: 10000, expense: 6000 },
    { month: 'Fév', revenue: 12000, expense: 7000 },
    { month: 'Mar', revenue: 15000, expense: 8000 },
    { month: 'Avr', revenue: 13000, expense: 6500 },
    { month: 'Mai', revenue: 13000, expense: 6000 },
  ],
  documentStatusData: [
    { label: 'Valide', value: 60, color: '#4caf50' },
    { label: 'À expirer', value: 25, color: '#ff9800' },
    { label: 'Expiré', value: 15, color: '#f44336' },
  ],
};

// Composant réutilisable pour les cartes du tableau de bord
const DashboardCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' },
    }}
  >
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {children}
  </Paper>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(staticDashboardData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Pagination notifications
  const [notifPage, setNotifPage] = useState(1);
  const notifPerPage = 1;
  const notifPageCount = Math.ceil(notifications.length / notifPerPage);

  // Charger les notifications dynamiques
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getAllNotifications();
        setNotifications(data);
      } catch (err) {
        // Optionnel : setError('Erreur lors du chargement des notifications');
      }
    };
    fetchNotifications();
  }, []);

  // Simuler un appel API (à remplacer par une vraie API)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // const data = await fetchDashboardData();
        // setDashboardData(data);
        setDashboardData(staticDashboardData); // Utilisation des données statiques pour l'exemple
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Optimisation des données des graphiques
  const barChartSeries = useMemo(
    () => [
      {
        label: 'Revenus',
        data: dashboardData.revenueExpenseData.map((d) => d.revenue),
        color: '#1976d2',
      },
      {
        label: 'Dépenses',
        data: dashboardData.revenueExpenseData.map((d) => d.expense),
        color: '#dc004e',
      },
    ],
    [dashboardData.revenueExpenseData]
  );

  // Props pour les éléments Grid
  const gridItemProps = { component: 'div' as const, item: true };

  if (!user) {
    return (
      <Container sx={{ py: 4, px: { xs: 2, md: 3 } }}>
        <Alert severity="error">Utilisateur non connecté</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, px: { xs: 2, md: 3 }, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, px: { xs: 2, md: 3 } }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Pagination logic
  const paginatedNotifications = notifications.slice(
    (notifPage - 1) * notifPerPage,
    notifPage * notifPerPage
  );

  return (
    <Container
      sx={{
        py: 4,
        px: { xs: 2, md: 3 },
        mt: { xs: 2, md: 0 },
        maxWidth: 'xl',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Bienvenue, cher {user.role === 'admin' ? 'Administrateur' : 'Chauffeur'}{' '}
        !
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Aperçu global des opérations de L&N ENTREPRISE
      </Typography>

      <Grid container spacing={3}>
        {/* Résumé financier */}
        <Grid {...gridItemProps} xs={12} sm={6} md={4}>
          <DashboardCard title="Résumé Financier">
            <Typography color="text.secondary">
              Revenus totaux :{' '}
              {dashboardData.financialData?.totalRevenue.toLocaleString(
                'fr-FR'
              )}{' '}
              FCFA
            </Typography>
            <Typography color="text.secondary">
              Dépenses totales :{' '}
              {dashboardData.financialData?.totalExpenses.toLocaleString(
                'fr-FR'
              )}{' '}
              FCFA
            </Typography>
            <Typography
              color={
                dashboardData.financialData?.netProfit !== undefined &&
                dashboardData.financialData?.netProfit >= 0
                  ? 'success.main'
                  : 'error.main'
              }
            >
              Bénéfice net :{' '}
              {dashboardData.financialData?.netProfit.toLocaleString('fr-FR')}{' '}
              FCFA
            </Typography>
          </DashboardCard>
        </Grid>

        {/* Notifications avec pagination et lien vers la page notifications */}
        <Grid {...gridItemProps} xs={12} sm={6} md={4}>
          <DashboardCard title="Notifications">
            <List dense aria-label="Notifications urgentes">
              {notifications.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Aucune notification" />
                </ListItem>
              ) : (
                paginatedNotifications.map((notif) => (
                  <ListItem key={notif.id}>
                    <ListItemText
                      primary={notif.message}
                      secondary={
                        notif.daysRemaining !== undefined
                          ? `${notif.daysRemaining} jours restants`
                          : ''
                      }
                    />
                    <Chip
                      label={
                        notif.type === 'permis_expiration' ? 'Permis' : 'Info'
                      }
                      color={
                        notif.type === 'permis_expiration' ? 'warning' : 'info'
                      }
                      size="small"
                    />
                  </ListItem>
                ))
              )}
            </List>
            {notifPageCount > 1 && (
              <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
                <Pagination
                  count={notifPageCount}
                  page={notifPage}
                  onChange={(_, value) => setNotifPage(value)}
                  size="small"
                  color="primary"
                />
              </Stack>
            )}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/notifications"
                variant="outlined"
                size="small"
              >
                Voir toutes les notifications
              </Button>
            </Box>
          </DashboardCard>
        </Grid>

        <Grid {...gridItemProps} xs={12} sm={6} md={4}>
          <DashboardCard title="Factures">
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Générez et exportez vos factures clients en PDF.
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/factures"
                variant="contained"
                color="primary"
                size="small"
              >
                Accéder à la gestion des factures
              </Button>
            </Box>
          </DashboardCard>
        </Grid>

        {/* Documents récents */}
        {/* <Grid {...gridItemProps} xs={12} sm={6} md={4}>
          <DashboardCard title="Documents Récents">
            <List dense aria-label="Documents récents">
              {dashboardData.recentDocuments.map((doc) => (
                <ListItem key={doc.id}>
                  <ListItemText
                    primary={doc.name}
                    secondary={`Ajouté le ${doc.dateAdded}`}
                  />
                </ListItem>
              ))}
            </List>
          </DashboardCard>
        </Grid> */}

        {/* Graphique des revenus/dépenses */}
        <Grid {...gridItemProps} xs={12} md={6}>
          <DashboardCard title="Revenus vs Dépenses (2025)">
            <Box sx={{ overflowX: 'auto' }}>
              <BarChart
                xAxis={[
                  {
                    scaleType: 'band',
                    data: dashboardData.revenueExpenseData.map((d) => d.month),
                  },
                ]}
                series={barChartSeries}
                height={300}
                sx={{ minWidth: { xs: 300, md: 400 } }}
                aria-label="Graphique en barres comparant les revenus et dépenses par mois en 2025"
              />
            </Box>
          </DashboardCard>
        </Grid>

        {/* Graphique des statuts des documents */}
        <Grid {...gridItemProps} xs={12} md={6}>
          <DashboardCard title="Statut des Documents">
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart
                series={[
                  {
                    data: dashboardData.documentStatusData,
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                  },
                ]}
                height={300}
                aria-label="Graphique en anneau montrant le statut des documents : valide, à expirer, expiré"
              />
            </Box>
          </DashboardCard>
        </Grid>

        {/* Activités des chauffeurs */}
        <Grid {...gridItemProps} xs={12}>
          <DashboardCard title="Activités Récentes des Chauffeurs">
            <List aria-label="Activités récentes des chauffeurs">
              {dashboardData.driverActivities.map((activity, index) => (
                <Box key={activity.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Ticket ${activity.ticket} par ${activity.driver}`}
                      secondary={`Synchronisé le ${activity.date}`}
                    />
                  </ListItem>
                  {index < dashboardData.driverActivities.length - 1 && (
                    <Divider />
                  )}
                </Box>
              ))}
            </List>
          </DashboardCard>
        </Grid>
      </Grid>
    </Container>
  );
}
