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
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr as frLocale } from 'date-fns/locale';
import { isValid } from 'date-fns';
import type { Chauffeur, Camion } from '../types';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useState, forwardRef } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LicenseIcon from '@mui/icons-material/Assignment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import type { TransitionProps } from '@mui/material/transitions';
import { Slide } from '@mui/material';

// Animation for the dialog
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ChauffeurFormProps {
  open: boolean;
  isEditing: boolean;
  formData: Partial<Chauffeur>;
  camions: Camion[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: SelectChangeEvent<string>) => void;
  handleDateChange: (field: string, date: Date | null) => void;
  handleCloseDialog: () => void;
  handleSubmit: (data: Partial<Chauffeur>) => void;
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
  const [localError, setLocalError] = useState<string>('');

  const validateForm = () => {
    if (!formData.nom) return 'Le nom est requis.';
    if (!formData.email) return "L'email est requis.";
    if (!formData.role) return 'Le rôle est requis.';
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      return 'Le mot de passe est requis et doit contenir au moins 6 caractères pour un nouvel utilisateur.';
    }
    if (formData.permisDelivrance && !isValid(formData.permisDelivrance)) {
      return 'La date de délivrance du permis est invalide.';
    }
    if (formData.permisExpiration && !isValid(formData.permisExpiration)) {
      return "La date d'expiration du permis est invalide.";
    }
    if (
      formData.camionId &&
      !camions.some((camion) => camion.id === formData.camionId)
    ) {
      return "L'identifiant du camion n'est pas valide.";
    }
    return null;
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setLocalError(error);
      return;
    }
    setLocalError('');

    const dataToSend: Partial<Chauffeur> = {
      ...formData,
      permisDelivrance: formData.permisDelivrance
        ? isValid(formData.permisDelivrance)
          ? formData.permisDelivrance.toISOString()
          : null
        : null,
      permisExpiration: formData.permisExpiration
        ? isValid(formData.permisExpiration)
          ? formData.permisExpiration.toISOString()
          : null
        : null,
      password: formData.password ? formData.password : undefined,
    };

    // Remove empty, undefined fields and id
    (Object.keys(dataToSend) as (keyof Partial<Chauffeur>)[]).forEach((key) => {
      if (
        dataToSend[key] === undefined ||
        dataToSend[key] === '' ||
        key === 'id'
      ) {
        delete dataToSend[key];
      }
    });

    handleSubmit(dataToSend);
  };

  // Filter unassigned trucks or those assigned to this driver
  const availableCamions = camions.filter(
    (camion) =>
      !camion.driverId ||
      camion.id === formData.camionId ||
      camion.driverId === formData.id
  );

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
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
        <PersonIcon />
        {isEditing ? 'Modifier un chauffeur' : 'Ajouter un nouveau chauffeur'}
      </DialogTitle>
      <form onSubmit={onFormSubmit} autoComplete="off">
        <DialogContent sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* General Information Section */}
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
                    <PersonIcon fontSize="small" />
                    Informations générales
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="nom"
                      value={formData.nom || ''}
                      onChange={handleInputChange}
                      required
                      error={!formData.nom}
                      helperText={!formData.nom ? 'Le nom est requis' : ''}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required
                      error={!formData.email}
                      helperText={!formData.email ? "L'email est requis" : ''}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Mot de passe"
                      name="password"
                      type="password"
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      required={!isEditing}
                      autoComplete="new-password"
                      error={!isEditing && !formData.password}
                      helperText={
                        !isEditing && !formData.password
                          ? 'Le mot de passe est requis'
                          : ''
                      }
                      variant="outlined"
                      size="small"
                    />
                    <FormControl fullWidth error={!formData.role}>
                      <InputLabel>Rôle</InputLabel>
                      <Select
                        name="role"
                        value={formData.role || ''}
                        label="Rôle"
                        onChange={handleSelectChange}
                        required
                        size="small"
                      >
                        <MenuItem value="driver">
                          <Chip
                            label="Chauffeur"
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          Chauffeur
                        </MenuItem>
                        <MenuItem value="admin">
                          <Chip
                            label="Administrateur"
                            color="secondary"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          Administrateur
                        </MenuItem>
                      </Select>
                      {!formData.role && (
                        <Typography color="error" variant="caption">
                          Le rôle est requis
                        </Typography>
                      )}
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Camion assigné</InputLabel>
                      <Select
                        name="camionId"
                        value={formData.camionId || ''}
                        label="Camion assigné"
                        onChange={handleSelectChange}
                        size="small"
                        startAdornment={
                          <DirectionsCarIcon
                            fontSize="small"
                            color="action"
                            sx={{ mr: 1 }}
                          />
                        }
                      >
                        <MenuItem value="">
                          <Chip
                            label="Non assigné"
                            color="default"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          Non assigné
                        </MenuItem>
                        {availableCamions.length === 0 ? (
                          <MenuItem value="" disabled>
                            Aucun camion disponible
                          </MenuItem>
                        ) : (
                          availableCamions.map((camion) => (
                            <MenuItem key={camion.id} value={camion.id}>
                              <Chip
                                label={camion.nom}
                                color="primary"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              {camion.nom}{' '}
                              {camion.immatriculation
                                ? `(${camion.immatriculation})`
                                : ''}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* License Information Section */}
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
                    <LicenseIcon fontSize="small" />
                    Informations de permis
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Numéro de permis"
                      name="permisNumero"
                      value={formData.permisNumero || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Catégorie de permis"
                      name="permisCategorie"
                      value={formData.permisCategorie || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={frLocale}
                    >
                      <DatePicker
                        label="Date de délivrance"
                        value={formData.permisDelivrance || null}
                        onChange={(date) =>
                          handleDateChange('permisDelivrance', date)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            size: 'small',
                            error:
                              !!formData.permisDelivrance &&
                              !isValid(formData.permisDelivrance),
                            helperText:
                              formData.permisDelivrance &&
                              !isValid(formData.permisDelivrance)
                                ? 'Date invalide'
                                : '',
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={frLocale}
                    >
                      <DatePicker
                        label="Date d'expiration"
                        value={formData.permisExpiration || null}
                        onChange={(date) =>
                          handleDateChange('permisExpiration', date)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            size: 'small',
                            error:
                              !!formData.permisExpiration &&
                              !isValid(formData.permisExpiration),
                            helperText:
                              formData.permisExpiration &&
                              !isValid(formData.permisExpiration)
                                ? 'Date invalide'
                                : '',
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <TextField
                      fullWidth
                      label="Lieu de délivrance"
                      name="permisLieu"
                      value={formData.permisLieu || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {localError && (
              <Grid item xs={12}>
                <Typography color="error" sx={{ mt: 1 }}>
                  {localError}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            bgcolor: 'grey.50',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 20, textTransform: 'none', px: 3 }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 20, textTransform: 'none', px: 3 }}
          >
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}