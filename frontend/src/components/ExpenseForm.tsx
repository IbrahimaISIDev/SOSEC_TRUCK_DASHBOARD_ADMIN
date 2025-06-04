import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  FormHelperText,
} from '@mui/material';
import { useState } from 'react';
import type { Expense, Chauffeur } from '../types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fr } from 'date-fns/locale';
import { isValid } from 'date-fns';

interface ExpenseFormProps {
  open: boolean;
  isEditing: boolean;
  formData: Partial<Expense>;
  chauffeurs: Chauffeur[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: import('@mui/material').SelectChangeEvent<string>) => void;
  handleDateChange: (field: string, date: Date | null) => void;
  handleCloseDialog: () => void;
  handleSubmit: (data: Partial<Expense>) => void;
}

const ExpenseForm = ({
  open,
  isEditing,
  formData,
  chauffeurs,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  handleCloseDialog,
  handleSubmit,
}: ExpenseFormProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.driverId) newErrors.driverId = 'Le chauffeur est requis';
    if (!formData.type) newErrors.type = 'Le type est requis';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Le montant doit être supérieur à 0';
    if (!formData.date || !isValid(new Date(formData.date))) newErrors.date = 'La date est requise et doit être valide';
    if (formData.quantity && formData.quantity < 0) newErrors.quantity = 'La quantité ne peut pas être négative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSend: Partial<Expense> = {
        ...formData,
        amount: formData.amount ? Number(formData.amount) : undefined,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
      };
      handleSubmit(dataToSend);
    }
  };

  const safeChauffeurs = Array.isArray(chauffeurs) ? chauffeurs : [];

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Modifier la dépense' : 'Ajouter une dépense'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.driverId}>
                  <InputLabel>Chauffeur</InputLabel>
                  <Select
                    name="driverId"
                    value={formData.driverId || ''}
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
                  <FormHelperText>{errors.driverId}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <MenuItem value="">Sélectionner un type</MenuItem>
                    <MenuItem value="carburant">Carburant</MenuItem>
                    <MenuItem value="huile">Huile</MenuItem>
                    <MenuItem value="reparations">Réparations</MenuItem>
                    <MenuItem value="autres">Autres</MenuItem>
                  </Select>
                  <FormHelperText>{errors.type}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Mode de saisie</InputLabel>
                  <Select
                    name="entryType"
                    value={formData.entryType || ''}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">Sélectionner un mode</MenuItem>
                    <MenuItem value="manual">Manuel</MenuItem>
                    <MenuItem value="scan">Scan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Date"
                  value={formData.date ? new Date(formData.date) : null}
                  onChange={(date) => handleDateChange('date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date,
                      required: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantité (litres)"
                  name="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={handleInputChange}
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Montant (FCFA)"
                  name="amount"
                  type="number"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lieu"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Mode de paiement</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod || ''}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">Sélectionner un mode</MenuItem>
                    <MenuItem value="cash">Espèces</MenuItem>
                    <MenuItem value="card">Carte</MenuItem>
                    <MenuItem value="mobileMoney">Mobile Money</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL de l'image"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleInputChange}
                  disabled={isEditing} // URL gérée par Firebase
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
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

export default ExpenseForm;