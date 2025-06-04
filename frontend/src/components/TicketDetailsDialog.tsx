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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';
import ReceiptIcon from '@mui/icons-material/Receipt';
import type { Ticket, Chauffeur, Camion } from '../types';

// Animation pour le dialogue
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TicketDetailsDialogProps {
  open: boolean;
  ticket: Ticket | null;
  chauffeurs: Chauffeur[];
  camions: Camion[];
  onClose: () => void;
}

export default function TicketDetailsDialog({
  open,
  ticket,
  chauffeurs,
  camions,
  onClose,
}: TicketDetailsDialogProps) {
  if (!ticket) return null;

  const chauffeur = chauffeurs.find((c) => c.id === ticket.driver);
  const camion = camions.find((c) => c.id === ticket.camionId);

  // Parse extraData
  let extraData: { [key: string]: any } = {};
  try {
    const extraDataStr =
      typeof ticket.extraData === 'string'
        ? ticket.extraData
        : JSON.stringify(ticket.extraData ?? {});
    extraData = JSON.parse(extraDataStr || '{}');
  } catch (e) {
    console.error('Erreur lors du parsing de extraData:', e);
  }

  // Fonction pour formater les clés pour l'affichage
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Fonction pour vérifier si une valeur est un objet ou un tableau
  const isObjectOrArray = (value: any) => {
    return value && (Array.isArray(value) || typeof value === 'object');
  };

  // Extraire les champs essentiels
  const ticketNum =
    ticket.ticketNum ||
    extraData.ticket_number ||
    extraData.numero_ticket ||
    extraData['Numéro de Vente'] ||
    extraData.bon_approvisionnement_numero ||
    'N/A';

  const dateEntrance =
    ticket.dateEntrance ||
    extraData.entry_date ||
    extraData.date ||
    extraData.Date ||
    'N/A';

  const netWeight =
    ticket.netWeight ||
    extraData.net_weight ||
    extraData['Poids Net'] ||
    'N/A';

  const getSyncStatusChip = (syncStatus: string) => {
    switch (syncStatus.toLowerCase()) {
      case 'synced':
        return { label: 'Synchronisé', color: 'success' };
      case 'local':
        return { label: 'Local', color: 'warning' };
      default:
        return { label: 'N/A', color: 'default' };
    }
  };

  const syncStatusChip = getSyncStatusChip(ticket.syncStatus || 'N/A');

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
        Détail du ticket
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
                      Numéro
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {ticketNum}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {ticket.type || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Chauffeur
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {chauffeur ? chauffeur.nom : 'Non assigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Camion
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {camion
                        ? camion.nom || camion.immatriculation || 'N/A'
                        : 'Non assigné'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date Entrée
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {dateEntrance !== 'N/A'
                        ? new Date(dateEntrance).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Poids Net
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {netWeight !== 'N/A' ? `${netWeight}` : 'N/A'}
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
                  {Object.keys(extraData).length > 0 ? (
                    Object.entries(extraData).map(([key, value]) => (
                      <Box key={key}>
                        {isObjectOrArray(value) ? (
                          <>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              {formatKey(key)}
                            </Typography>
                            {Array.isArray(value) &&
                            key.toLowerCase().includes('produit') ? (
                              <Box sx={{ mt: 1, overflowX: 'auto' }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Nom</TableCell>
                                      <TableCell>Quantité</TableCell>
                                      <TableCell>Prix Unitaire</TableCell>
                                      <TableCell>Prix Total</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {value.map((item: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {item.nom || item.NomProduit || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                          {item.quantite || item.Quantité || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                          {item.prix_unitaire ||
                                            item['Prix Unitaire'] ||
                                            'N/A'}
                                        </TableCell>
                                        <TableCell>
                                          {item.prix_total ||
                                            item['Prix Total'] ||
                                            'N/A'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            ) : Array.isArray(value) ? (
                              <Typography variant="body1" fontWeight="medium">
                                {value.join(', ')}
                              </Typography>
                            ) : (
                              Object.entries(value).map(([subKey, subValue]) => (
                                <Box key={subKey}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    {formatKey(subKey)}
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                  >
                                    {subValue?.toString() || 'N/A'}
                                  </Typography>
                                </Box>
                              ))
                            )}
                          </>
                        ) : (
                          <>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              {formatKey(key)}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {value?.toString() || 'N/A'}
                            </Typography>
                          </>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" fontWeight="medium">
                      Aucune information supplémentaire disponible.
                    </Typography>
                  )}
                  {ticket.imageUrl && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Document
                      </Typography>
                      {ticket.imageUrl.toLowerCase().endsWith('.pdf') ? (
                        <a
                          href={ticket.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: 'primary.main' }}
                        >
                          Voir le PDF
                        </a>
                      ) : (
                        <img
                          src={ticket.imageUrl}
                          alt="Document"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            marginTop: 8,
                            borderRadius: 4,
                          }}
                        />
                      )}
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