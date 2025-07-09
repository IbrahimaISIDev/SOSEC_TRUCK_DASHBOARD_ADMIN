import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Stack,
  Divider,
  Pagination,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getAllNotifications } from '../api/notificationApi';
import type { Notification } from '../types';

const NOTIF_PER_PAGE = 10;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getAllNotifications();
        setNotifications(data);
      } catch (err) {
        setError('Erreur lors du chargement des notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const paginatedNotifications = notifications.slice(
    (page - 1) * NOTIF_PER_PAGE,
    page * NOTIF_PER_PAGE
  );
  const pageCount = Math.ceil(notifications.length / NOTIF_PER_PAGE);

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, maxWidth: 'md' }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          mb: 3,
          bgcolor: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <NotificationsActiveIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>
            Notifications
          </Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Retrouvez ici toutes les notifications importantes concernant les chauffeurs, les permis et et les assurances des camions.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="Aucune notification" />
            </ListItem>
          ) : (
            paginatedNotifications.map((notif, idx) => (
              <Box key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notif.type === 'permis_expiration' ? 'orange.50' : 'grey.50',
                    borderRadius: 2,
                    mb: 1,
                    boxShadow: 1,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                    <Box>
                      {notif.type === 'permis_expiration' ? (
                        <WarningAmberIcon color="warning" />
                      ) : (
                        <InfoOutlinedIcon color="info" />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} color="text.primary">
                            {notif.message}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              {notif.daysRemaining !== undefined
                                ? notif.daysRemaining < 0
                                  ? `Expiré il y a ${-notif.daysRemaining} jours`
                                  : `Expire dans ${notif.daysRemaining} jours`
                                : ''}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {notif.utilisateur?.nom && `Utilisateur : ${notif.utilisateur.nom}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {notif.createdAt &&
                                `Créée le ${new Date(notif.createdAt).toLocaleDateString('fr-FR')}`}
                            </Typography>
                          </Stack>
                        }
                      />
                    </Box>
                    <Chip
                      label={notif.type === 'permis_expiration' ? 'Permis' : 'Info'}
                      color={notif.type === 'permis_expiration' ? 'warning' : 'info'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Stack>
                </ListItem>
                {idx < paginatedNotifications.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
        {pageCount > 1 && (
          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="medium"
            />
          </Stack>
        )}
      </Paper>
    </Container>
  );
}