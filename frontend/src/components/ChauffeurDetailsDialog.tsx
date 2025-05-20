import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LicenseIcon from '@mui/icons-material/Assignment';

// Animation pour le dialogue
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ChauffeurDetailsDialog({
  open,
  chauffeur,
  camions,
  onClose,
  onEdit,
}: any) {
  if (!chauffeur) return null;

  const camion = chauffeur.camionId
    ? camions.find((c: any) => c.id === chauffeur.camionId)
    : null;

  const today = new Date();
  const expDate = chauffeur.permisExpiration
    ? new Date(chauffeur.permisExpiration)
    : null;
  const daysLeft = expDate
    ? Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    : null;

  const getPermisStatus = () => {
    if (!daysLeft) return { label: 'Non renseigné', color: 'default' };
    if (daysLeft <= 0) return { label: `Expiré depuis ${Math.abs(daysLeft)} jours`, color: 'error' };
    if (daysLeft <= 30) return { label: `Expire dans ${daysLeft} jours`, color: 'warning' };
    return { label: `Valide (expire dans ${daysLeft} jours)`, color: 'success' };
  };

  const permisStatus = getPermisStatus();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon />
        Détails du chauffeur
      </DialogTitle>
      <DialogContent sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Section Informations générales */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, bgcolor: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <PersonIcon fontSize="small" />
                  Informations générales
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nom
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur.nom}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rôle
                    </Typography>
                    <Chip
                      label={chauffeur.role === 'driver' ? 'Chauffeur' : 'Administrateur'}
                      color={chauffeur.role === 'driver' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Camion assigné
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCarIcon fontSize="small" color="action" />
                      {camion ? camion.immatriculation : 'Non assigné'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Section Informations de permis */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, bgcolor: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <LicenseIcon fontSize="small" />
                  Informations de permis
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Numéro de permis
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur.permisNumero || 'Non renseigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Catégorie de permis
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur.permisCategorie || 'Non renseigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date de délivrance
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur.permisDelivrance
                        ? new Date(chauffeur.permisDelivrance).toLocaleDateString('fr-FR')
                        : 'Non renseigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date d'expiration
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur.permisExpiration
                        ? new Date(chauffeur.permisExpiration).toLocaleDateString('fr-FR')
                        : 'Non renseigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lieu de délivrance
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur.permisLieu || 'Non renseigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Statut du permis
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={permisStatus.label}
                        color={permisStatus.color as 'default' | 'success' | 'warning' | 'error'}
                        size="medium"
                        sx={{ fontWeight: 'medium' }}
                      />
                      {permisStatus.color !== 'default' && (
                        <Typography variant="body2" color="text.secondary">
                          (expire le {expDate?.toLocaleDateString('fr-FR')})
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: 'grey.50', justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: 20, textTransform: 'none', px: 3 }}
        >
          Fermer
        </Button>
        <Button
          onClick={onEdit}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 20, textTransform: 'none', px: 3 }}
        >
          Modifier
        </Button>
      </DialogActions>
    </Dialog>
  );
}