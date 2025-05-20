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
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr as frLocale } from 'date-fns/locale';
import { isValid } from 'date-fns';

interface ChauffeurFormProps {
  open: boolean;
  isEditing: boolean;
  formData: any;
  camions: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (
    e: import('@mui/material').SelectChangeEvent<any>
  ) => void;
  handleDateChange: (field: string, date: Date | null) => void;
  handleCloseDialog: () => void;
  handleSubmit: (data: any) => void;
}

export default function ChauffeurForm({
  open,
  isEditing,
  formData,
  camions,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  handleCloseDialog,
  handleSubmit,
}: ChauffeurFormProps) {
  // Validation des champs
  const validateForm = () => {
    if (!formData.nom) return 'Le nom est requis.';
    if (!formData.email) return "L'email est requis.";
    if (!formData.role) return 'Le rôle est requis.';
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      return 'Le mot de passe est requis et doit contenir au moins 6 caractères pour un nouvel utilisateur.';
    }
    if (
      formData.permisDelivrance &&
      !isValid(new Date(formData.permisDelivrance))
    ) {
      return 'La date de délivrance du permis est invalide.';
    }
    if (
      formData.permisExpiration &&
      !isValid(new Date(formData.permisExpiration))
    ) {
      return "La date d'expiration du permis est invalide.";
    }
    return null;
  };

  // Gestion de la soumission
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    // Préparation des données à envoyer
    const dataToSend = {
      ...formData,
      permisDelivrance: formData.permisDelivrance
        ? new Date(formData.permisDelivrance).toISOString()
        : null,
      permisExpiration: formData.permisExpiration
        ? new Date(formData.permisExpiration).toISOString()
        : null,
      password: isEditing ? undefined : formData.password,
    };

    // Nettoyage des champs vides ou undefined
    Object.keys(dataToSend).forEach(
      (key) =>
        (dataToSend[key] === undefined || dataToSend[key] === '') &&
        delete dataToSend[key]
    );

    console.log('Payload envoyé au backend :', dataToSend);
    handleSubmit(dataToSend);
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Modifier un chauffeur' : 'Ajouter un nouveau chauffeur'}
      </DialogTitle>
      <form onSubmit={onFormSubmit} autoComplete="off">
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
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                required
                margin="normal"
                error={!formData.email}
                helperText={!formData.email ? "L'email est requis" : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                required={!isEditing}
                margin="normal"
                autoComplete="new-password"
                error={!isEditing && !formData.password}
                helperText={
                  !isEditing && !formData.password
                    ? 'Le mot de passe est requis'
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" error={!formData.role}>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role || ''}
                  label="Rôle"
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="driver">Chauffeur</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                </Select>
                {!formData.role && (
                  <Typography color="error" variant="caption">
                    Le rôle est requis
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Camion assigné</InputLabel>
                <Select
                  name="camionId"
                  value={formData.camionId || ''}
                  label="Camion assigné"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">Non assigné</MenuItem>
                  {camions.map((camion: any) => (
                    <MenuItem key={camion.id} value={camion.id}>
                      {camion.immatriculation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Informations de permis
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Numéro de permis"
                name="permisNumero"
                value={formData.permisNumero || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Catégorie de permis"
                name="permisCategorie"
                value={formData.permisCategorie || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={frLocale}
              >
                <DatePicker
                  label="Date de délivrance"
                  value={
                    formData.permisDelivrance
                      ? new Date(formData.permisDelivrance)
                      : null
                  }
                  onChange={(date) =>
                    handleDateChange('permisDelivrance', date)
                  }
                  sx={{ width: '100%', mt: 2 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error:
                        formData.permisDelivrance &&
                        !isValid(new Date(formData.permisDelivrance)),
                      helperText:
                        formData.permisDelivrance &&
                        !isValid(new Date(formData.permisDelivrance))
                          ? 'Date invalide'
                          : '',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={frLocale}
              >
                <DatePicker
                  label="Date d'expiration"
                  value={
                    formData.permisExpiration
                      ? new Date(formData.permisExpiration)
                      : null
                  }
                  onChange={(date) =>
                    handleDateChange('permisExpiration', date)
                  }
                  sx={{ width: '100%', mt: 2 }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error:
                        formData.permisExpiration &&
                        !isValid(new Date(formData.permisExpiration)),
                      helperText:
                        formData.permisExpiration &&
                        !isValid(new Date(formData.permisExpiration))
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
                label="Lieu de délivrance"
                name="permisLieu"
                value={formData.permisLieu || ''}
                onChange={handleInputChange}
                margin="normal"
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
