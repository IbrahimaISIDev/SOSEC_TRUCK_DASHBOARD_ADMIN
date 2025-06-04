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
import type { Mileage, Chauffeur, Camion } from '../types';
import type { SelectChangeEvent } from '@mui/material/Select';

interface MileageFormProps {
  open: boolean;
  isEditing: boolean;
  formData: Partial<Mileage>;
  chauffeurs: Chauffeur[];
  camions: Camion[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: SelectChangeEvent<string>) => void;
  handleDateChange: (field: string, date: Date | null) => void;
  handleCloseDialog: () => void;
  handleSubmit: (data: Partial<Mileage>) => void;
}

export default function MileageForm({
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
}: MileageFormProps) {
  const validateForm = () => {
    if (!formData.camionId) return 'Le camion est requis.';
    if (!formData.driverId) return 'Le chauffeur est requis.';
    if (!formData.distance || formData.distance <= 0) return 'La distance doit être supérieure à 0.';
    if (!formData.date || !isValid(new Date(formData.date))) return 'La date est invalide.';
    return null;
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    const dataToSend: Partial<Mileage> = {
      ...formData,
      date: formData.date ? new Date(formData.date).toISOString() : null,
      distance: formData.distance ? Number(formData.distance) : undefined,
    };

    handleSubmit(dataToSend);
  };

  const safeChauffeurs = Array.isArray(chauffeurs) ? chauffeurs : [];
  const safeCamions = Array.isArray(camions) ? camions : [];

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Modifier le kilométrage' : 'Ajouter un kilométrage'}
      </DialogTitle>
      <form onSubmit={onFormSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
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
              <FormControl fullWidth margin="normal" error={!formData.driverId}>
                <InputLabel>Chauffeur</InputLabel>
                <Select
                  name="driverId"
                  value={formData.driverId || ''}
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
              <TextField
                fullWidth
                label="Distance (km)"
                name="distance"
                type="number"
                value={formData.distance || ''}
                onChange={handleInputChange}
                required
                margin="normal"
                error={!!formData.distance && formData.distance <= 0}
                helperText={
                  formData.distance && formData.distance <= 0
                    ? 'La distance doit être supérieure à 0'
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                <DatePicker
                  label="Date"
                  value={formData.date ? new Date(formData.date) : null}
                  onChange={(date) => handleDateChange('date', date)}
                  sx={{ width: '100%', mt: 2 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error: !!formData.date && !isValid(new Date(formData.date)),
                      helperText:
                        formData.date && !isValid(new Date(formData.date))
                          ? 'Date invalide'
                          : '',
                    },
                  }}
                />
              </LocalizationProvider>
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