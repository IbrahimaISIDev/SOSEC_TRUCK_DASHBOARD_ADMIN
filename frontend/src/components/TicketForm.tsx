import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr as frLocale } from 'date-fns/locale';
import { isValid } from 'date-fns';
import type { Ticket, Chauffeur, Camion } from '../types';
import type { SelectChangeEvent } from '@mui/material/Select';

interface TicketFormProps {
  open: boolean;
  isEditing: boolean;
  formData: Partial<Ticket>;
  chauffeurs: Chauffeur[];
  camions: Camion[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: SelectChangeEvent<string>) => void;
  handleDateChange: (field: string, date: Date | null) => void;
  handleCloseDialog: () => void;
  handleSubmit: (data: Partial<Ticket>) => void;
}

export default function TicketForm({
  open,
  isEditing,
  formData,
  chauffeurs,
  camions,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  handleCloseDialog,
  handleSubmit,
}: TicketFormProps) {
  const validateForm = () => {
    if (!formData.type) return 'Le type est requis.';
    if (!formData.ticketNum) return 'Le numéro du ticket est requis.';
    if (!formData.camionId) return 'Le camion est requis.';
    if (!formData.driver) return 'Le chauffeur est requis.';
    if (formData.dateEntrance && !isValid(new Date(formData.dateEntrance))) return 'La date d’entrée est invalide.';
    if (formData.dateExit && !isValid(new Date(formData.dateExit))) return 'La date de sortie est invalide.';
    if (formData.netWeight && formData.netWeight <= 0) return 'Le poids net doit être supérieur à 0.';
    return null;
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    const dataToSend: Partial<Ticket> = {
      ...formData,
      dateEntrance: formData.dateEntrance ? new Date(formData.dateEntrance).toISOString() : undefined,
      dateExit: formData.dateExit ? new Date(formData.dateExit).toISOString() : undefined,
      netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
    };

    handleSubmit(dataToSend);
  };

  const safeChauffeurs = Array.isArray(chauffeurs) ? chauffeurs : [];
  const safeCamions = Array.isArray(camions) ? camions : [];

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Modifier le ticket' : 'Ajouter un ticket'}
      </DialogTitle>
      <form onSubmit={onFormSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={!formData.type}>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type || ''}
                  label="Type"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="">Sélectionner un type</MenuItem>
                  <MenuItem value="weight">Poids</MenuItem>
                  <MenuItem value="fuel">Carburant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Numéro du ticket"
                name="ticketNum"
                value={formData.ticketNum || ''}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={!formData.camionId}>
                <InputLabel>Camion</InputLabel>
                <Select
                  name="camionId"
                  value={formData.camionId || ''}
                  label="Camion"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="">Sélectionner un camion</MenuItem>
                  {safeCamions.length === 0 ? (
                    <MenuItem value="" disabled>
                      Aucun camion disponible
                    </MenuItem>
                  ) : (
                    safeCamions.map((camion) => (
                      <MenuItem key={camion.id} value={camion.id}>
                        {camion.nom} {camion.immatriculation ? `(${camion.immatriculation})` : ''}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={!formData.driver}>
                <InputLabel>Chauffeur</InputLabel>
                <Select
                  name="driverId"
                  value={formData.driver || ''}
                  label="Chauffeur"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="">Sélectionner un chauffeur</MenuItem>
                  {safeChauffeurs.length === 0 ? (
                    <MenuItem value="" disabled>
                      Aucun chauffeur disponible
                    </MenuItem>
                  ) : (
                    safeChauffeurs.map((chauffeur) => (
                      <MenuItem key={chauffeur.id} value={chauffeur.id}>
                        {chauffeur.nom}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                <DatePicker
                  label="Date d’entrée"
                  value={formData.dateEntrance ? new Date(formData.dateEntrance) : null}
                  onChange={(date) => handleDateChange('dateEntrance', date)}
                  sx={{ width: '100%', mt: 2 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error: !!formData.dateEntrance && !isValid(new Date(formData.dateEntrance)),
                      helperText:
                        formData.dateEntrance && !isValid(new Date(formData.dateEntrance))
                          ? 'Date invalide'
                          : '',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                <DatePicker
                  label="Date de sortie"
                  value={formData.dateExit ? new Date(formData.dateExit) : null}
                  onChange={(date) => handleDateChange('dateExit', date)}
                  sx={{ width: '100%', mt: 2 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error: !!formData.dateExit && !isValid(new Date(formData.dateExit)),
                      helperText:
                        formData.dateExit && !isValid(new Date(formData.dateExit))
                          ? 'Date invalide'
                          : '',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Produit"
                name="product"
                value={formData.product || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Poids net (kg)"
                name="netWeight"
                type="number"
                value={formData.netWeight || ''}
                onChange={handleInputChange}
                margin="normal"
                error={!!formData.netWeight && formData.netWeight <= 0}
                helperText={
                  formData.netWeight && formData.netWeight <= 0
                    ? 'Le poids net doit être supérieur à 0'
                    : ''
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}