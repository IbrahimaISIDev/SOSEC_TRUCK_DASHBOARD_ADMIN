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
import ReceiptIcon from '@mui/icons-material/Receipt';
import type { Expense } from '../types';

// Animation pour le dialogue
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ExpenseDetailsDialogProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export default function ExpenseDetailsDialog({
  open,
  expense,
  onClose,
}: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  const getSyncStatusChip = (syncStatus: string) => {
    switch (syncStatus.toLowerCase()) {
      case 'synced':
        return { label: 'Synchronisé', color: 'success' };
      case 'pending':
        return { label: 'En attente', color: 'warning' };
      default:
        return { label: 'N/A', color: 'default' };
    }
  };

  const syncStatusChip = getSyncStatusChip(expense.syncStatus || 'N/A');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Transition}
      sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ReceiptIcon />
        Détail de la dépense
      </DialogTitle>
      <DialogContent sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Section Informations générales */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, bgcolor: 'white' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'primary.main',
                  }}
                >
                  <ReceiptIcon fontSize="small" />
                  Informations générales
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Chauffeur
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.driverName || 'Non assigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.type || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Montant
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.amount
                        ? `${expense.amount.toFixed(2)} FCFA`
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.date
                        ? new Date(expense.date).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mode de paiement
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.paymentMethod
                        ? expense.paymentMethod.charAt(0).toUpperCase() +
                          expense.paymentMethod.slice(1)
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Statut Sync
                    </Typography>
                    <Chip
                      label={syncStatusChip.label}
                      color={
                        syncStatusChip.color as
                          | 'success'
                          | 'warning'
                          | 'default'
                      }
                      size="medium"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Section Détails supplémentaires */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, bgcolor: 'white' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'primary.main',
                  }}
                >
                  <ReceiptIcon fontSize="small" />
                  Détails supplémentaires
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.description || 'Non renseigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lieu
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.location || 'Non renseigné'}
                    </Typography>
                  </Box>
                  {/* <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type d'entrée
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.entryType || 'Non renseigné'}
                    </Typography>
                  </Box> */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Quantité
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.quantity
                        ? `${expense.quantity}`
                        : 'Non renseigné'}
                    </Typography>
                  </Box>
                  {expense.imageUrl && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Reçu
                      </Typography>
                      <img
                        src={expense.imageUrl}
                        alt="Reçu"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          marginTop: 8,
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{ p: 3, bgcolor: 'grey.50', justifyContent: 'space-between' }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: 20, textTransform: 'none', px: 3 }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
