import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { isValid } from 'date-fns';
import type { Camion } from '../api/camionApi';

// Définition de l'interface Chauffeur ici car elle n'est pas exportée par camionApi
interface Chauffeur {
  id: string;
  nom: string;
  email: string;
  role: 'admin' | 'driver';
  permisNumero?: string;
  permisDelivrance?: Date | null;
  permisExpiration?: Date | null;
  permisLieu?: string;
  permisCategorie?: string;
  camionId?: string;
  camion?: Camion;
}

interface CamionFormProps {
  open: boolean;
  isEditing: boolean;
  formData: Partial<Camion>;
  chauffeurs: Chauffeur[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: import('@mui/material').SelectChangeEvent<any>) => void;
  handleDateChange: (field: string, date: Date | null) => void;
  handleCloseDialog: () => void;
  handleSubmit: (data: Partial<Camion>) => void;
}

const CamionForm = ({
  open,
  isEditing,
  formData,
  chauffeurs,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  handleCloseDialog,
  handleSubmit,
}: CamionFormProps) => {
  const validateForm = () => {
    if (!formData.nom) return 'Le nom est requis.';
    if (!formData.type) return 'Le type est requis.';
    if (formData.assuranceExpiration && !isValid(new Date(formData.assuranceExpiration))) {
      return 'La date d\'expiration de l\'assurance est invalide.';
    }
    return null;
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    const dataToSend: Partial<Camion> = {
      nom: formData.nom,
      type: formData.type,
      immatriculation: formData.immatriculation || undefined,
      assuranceDetails: formData.assuranceDetails || undefined,
      assuranceExpiration: formData.assuranceExpiration || undefined,
      driverId: formData.driverId || undefined,
    };

    Object.keys(dataToSend).forEach(
      (key) => (dataToSend[key as keyof Partial<Camion>] === undefined || dataToSend[key as keyof Partial<Camion>] === '') && delete dataToSend[key as keyof Partial<Camion>]
    );

    console.log('Payload final envoyé au backend :', dataToSend);
    handleSubmit(dataToSend);
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Modifier un camion' : 'Ajouter un nouveau camion'}
      </DialogTitle>
      <form onSubmit={onFormSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={formData.nom || ''}
                onChange={handleInputChange}
                required
                margin="normal"
                error={!formData.nom}
                helperText={!formData.nom ? 'Le nom est requis' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={formData.type || ''}
                onChange={handleInputChange}
                required
                margin="normal"
                error={!formData.type}
                helperText={!formData.type ? 'Le type est requis' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Immatriculation"
                name="immatriculation"
                value={formData.immatriculation || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Chauffeur assigné</InputLabel>
                <Select
                  name="driverId"
                  value={formData.driverId || ''}
                  label="Chauffeur assigné"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">Non assigné</MenuItem>
                  {chauffeurs.map((chauffeur) => (
                    <MenuItem key={chauffeur.id} value={chauffeur.id}>
                      {chauffeur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Détails de l'assurance"
                name="assuranceDetails"
                value={formData.assuranceDetails || ''}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Expiration de l'assurance"
                  value={formData.assuranceExpiration ? new Date(formData.assuranceExpiration) : null}
                  onChange={(date) => handleDateChange('assuranceExpiration', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: !!(formData.assuranceExpiration && !isValid(new Date(formData.assuranceExpiration))),
                      helperText: formData.assuranceExpiration && !isValid(new Date(formData.assuranceExpiration)) ? 'Date invalide' : '',
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
};

export default CamionForm;