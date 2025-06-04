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
import { fr } from 'date-fns/locale';
import { isValid } from 'date-fns';
import type { Camion, Chauffeur } from '../types';
import { forwardRef, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InsuranceIcon from '@mui/icons-material/Assignment';
import type { TransitionProps } from '@mui/material/transitions';
import { Slide } from '@mui/material';

// Animation for the dialog
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CamionFormProps {
  open: boolean;
  isEditing: boolean;
  formData: Partial<Camion>;
  chauffeurs: Chauffeur[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (
    e: import('@mui/material').SelectChangeEvent<string>
  ) => void;
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
  const [localError, setLocalError] = useState<string>('');

  const validateForm = () => {
    if (!formData.nom) return 'Le nom est requis.';
    if (!formData.type) return 'Le type est requis.';
    if (
      formData.assuranceExpiration &&
      !isValid(new Date(formData.assuranceExpiration))
    ) {
      return "La date d'expiration de l'assurance est invalide.";
    }
    if (
      formData.driverId &&
      !chauffeurs.some((chauffeur) => chauffeur.id === formData.driverId)
    ) {
      return "L'identifiant du chauffeur n'est pas valide.";
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

    let parsedAssuranceDetails = undefined;
    if (
      formData.assuranceDetails &&
      typeof formData.assuranceDetails === 'string'
    ) {
      try {
        parsedAssuranceDetails = JSON.parse(formData.assuranceDetails);
      } catch (err) {
        setLocalError("Les détails de l'assurance doivent être un JSON valide.");
        return;
      }
    }

    const dataToSend: Partial<Camion> = {
      nom: formData.nom,
      type: formData.type,
      immatriculation: formData.immatriculation || undefined,
      assuranceDetails: parsedAssuranceDetails || undefined,
      assuranceExpiration: formData.assuranceExpiration
        ? new Date(formData.assuranceExpiration).toISOString()
        : undefined,
      driverId: formData.driverId || undefined,
    };

    Object.keys(dataToSend).forEach(
      (key) =>
        (dataToSend[key as keyof Partial<Camion>] === undefined ||
          dataToSend[key as keyof Partial<Camion>] === '') &&
        delete dataToSend[key as keyof Partial<Camion>]
    );

    console.log('Payload final envoyé au backend :', dataToSend);
    handleSubmit(dataToSend);
  };

  const availableChauffeurs = chauffeurs.filter(
    (chauffeur) =>
      !chauffeur.camionId ||
      chauffeur.camionId === formData.id ||
      chauffeur.id === formData.driverId
  );

  const validDriverId =
    formData.driverId &&
    availableChauffeurs.some((chauffeur) => chauffeur.id === formData.driverId)
      ? formData.driverId
      : '';

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
        <DirectionsCarIcon />
        {isEditing ? 'Modifier un camion' : 'Ajouter un nouveau camion'}
      </DialogTitle>
      <form onSubmit={onFormSubmit}>
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
                    <DirectionsCarIcon fontSize="small" />
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
                      label="Type"
                      name="type"
                      value={formData.type || ''}
                      onChange={handleInputChange}
                      required
                      error={!formData.type}
                      helperText={!formData.type ? 'Le type est requis' : ''}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Immatriculation"
                      name="immatriculation"
                      value={formData.immatriculation || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                    <FormControl fullWidth>
                      <InputLabel>Chauffeur assigné</InputLabel>
                      <Select
                        name="driverId"
                        value={validDriverId}
                        label="Chauffeur assigné"
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
                        {availableChauffeurs.map((chauffeur) => (
                          <MenuItem key={chauffeur.id} value={chauffeur.id}>
                            <Chip
                              label={chauffeur.nom}
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            {chauffeur.nom}{' '}
                            {chauffeur.camionId
                              ? `(Assigné à ${chauffeur.camion?.nom || 'un camion'})`
                              : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Insurance Information Section */}
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
                    <InsuranceIcon fontSize="small" />
                    Informations d'assurance
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Détails de l'assurance"
                      name="assuranceDetails"
                      value={
                        formData.assuranceDetails
                          ? typeof formData.assuranceDetails === 'string'
                            ? formData.assuranceDetails
                            : JSON.stringify(formData.assuranceDetails)
                          : ''
                      }
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      variant="outlined"
                      size="small"
                    />
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      adapterLocale={fr}
                    >
                      <DatePicker
                        label="Expiration de l'assurance"
                        value={
                          formData.assuranceExpiration
                            ? new Date(formData.assuranceExpiration)
                            : null
                        }
                        onChange={(date) =>
                          handleDateChange('assuranceExpiration', date)
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            size: 'small',
                            error: !!(
                              formData.assuranceExpiration &&
                              !isValid(new Date(formData.assuranceExpiration))
                            ),
                            helperText:
                              formData.assuranceExpiration &&
                              !isValid(new Date(formData.assuranceExpiration))
                                ? 'Date invalide'
                                : '',
                          },
                        }}
                      />
                    </LocalizationProvider>
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
};

export default CamionForm;