import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid } from '@mui/x-data-grid';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import ChauffeurForm from './ChauffeurForm';
import ChauffeurDetailsDialog from './ChauffeurDetailsDialog';
import type { Chauffeur } from '../types';
import type { Camion } from '../types';

interface ChauffeursListProps {
  chauffeurs: Chauffeur[];
  camions: Camion[];
  onAdd: (newChauffeur: Omit<Chauffeur, 'id'>) => void;
  onUpdate: (id: string, updatedData: Partial<Chauffeur>) => void;
  onDelete: (id: string) => void;
}

export default function ChauffeursList({
  chauffeurs,
  camions,
  onAdd,
  onUpdate,
  onDelete,
}: ChauffeursListProps) {
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Chauffeur>>({
    nom: '',
    email: '',
    password: '',
    role: 'driver',
    permisNumero: '',
    permisDelivrance: null,
    permisExpiration: null,
    permisLieu: '',
    permisCategorie: '',
    camionId: '',
  });
  const [openDetails, setOpenDetails] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const handleOpenForm = (chauffeur?: Chauffeur) => {
    if (chauffeur) {
      setFormData({
        ...chauffeur,
        password: '', // Ne pas pré-remplir le mot de passe en mode édition
      });
      setIsEditing(true);
      setSelectedChauffeur(chauffeur);
    } else {
      setFormData({
        nom: '',
        email: '',
        password: '',
        role: 'driver',
        permisNumero: '',
        permisDelivrance: null,
        permisExpiration: null,
        permisLieu: '',
        permisCategorie: '',
        camionId: '',
      });
      setIsEditing(false);
      setSelectedChauffeur(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedChauffeur(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, [e.target.name as string]: e.target.value });
  };

  const handleDateChange = (field: string, date: Date | null) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleSubmit = (data: Partial<Chauffeur>) => {
    // Validation des champs requis
    if (!data.nom || !data.email || !data.role) {
      alert('Les champs nom, email et rôle sont requis.');
      return;
    }
    if (isEditing && selectedChauffeur) {
      onUpdate(selectedChauffeur.id, data);
    } else {
      if (!data.password || data.password.length < 6) {
        alert(
          'Le mot de passe est requis et doit contenir au moins 6 caractères pour un nouvel utilisateur.'
        );
        return;
      }
      onAdd(data as Omit<Chauffeur, 'id'>);
    }
    handleCloseForm();
  };

  const handleOpenDetails = (chauffeur: Chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedChauffeur(null);
  };

  // Filtrage et recherche
  const filteredChauffeurs = useMemo(() => {
    return chauffeurs.filter((chauffeur) => {
      const matchesSearch =
        chauffeur.nom.toLowerCase().includes(searchText.toLowerCase()) ||
        chauffeur.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (chauffeur.permisNumero &&
          chauffeur.permisNumero
            .toLowerCase()
            .includes(searchText.toLowerCase()));
      const matchesRole = filterRole === 'all' || chauffeur.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [chauffeurs, searchText, filterRole]);

  // Colonnes du DataGrid
  const columns: GridColDef[] = [
    {
      field: 'nom',
      headerName: 'Nom',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Rôle',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === 'driver' ? 'Chauffeur' : 'Admin'}
          color={params.value === 'driver' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'permisNumero',
      headerName: 'Numéro de permis',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => params.value || '-',
    },
    {
      field: 'permisExpiration',
      headerName: 'Statut du permis',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return '-';
        const expDate = new Date(params.value);
        const today = new Date();
        const daysLeft = Math.ceil(
          (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );
        if (daysLeft <= 0) {
          return <Chip label="Expiré" color="error" size="small" />;
        } else if (daysLeft <= 30) {
          return (
            <Chip
              label={`Expire dans ${daysLeft} j`}
              color="warning"
              size="small"
            />
          );
        }
        return <Chip label="Valide" color="success" size="small" />;
      },
    },
    {
      field: 'camionId',
      headerName: 'Camion',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const camion = camions.find((c) => c.id === params.value);
        return camion ? camion.immatriculation : '-';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton onClick={() => handleOpenDetails(params.row)}>
            <Visibility color="action" />
          </IconButton>
          <IconButton onClick={() => handleOpenForm(params.row)}>
            <Edit color="primary" />
          </IconButton>
          <IconButton onClick={() => onDelete(params.row.id)}>
            <Delete color="error" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box
      sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, p: 3 }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Liste des chauffeurs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenForm()}
          sx={{ borderRadius: 20, textTransform: 'none' }}
        >
          Ajouter un chauffeur
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Rechercher"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Rôle</InputLabel>
          <Select
            value={filterRole}
            label="Rôle"
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="driver">Chauffeur</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ height: 500, bgcolor: 'white', borderRadius: 1 }}>
        <DataGrid
          rows={filteredChauffeurs}
          columns={columns}
          pageSizeOptions={[5, 10, 25, 100]}
          pagination
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
            },
            '& .MuiDataGrid-columnHeader': {
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'grey.100',
            },
            border: 0,
          }}
        />
      </Box>
      <ChauffeurForm
        open={openForm}
        isEditing={isEditing}
        formData={formData}
        camions={camions}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleDateChange={handleDateChange}
        handleCloseDialog={handleCloseForm}
        handleSubmit={handleSubmit}
      />
      <ChauffeurDetailsDialog
        open={openDetails}
        chauffeur={selectedChauffeur}
        camions={camions}
        onClose={handleCloseDetails}
        onEdit={() => {
          handleOpenForm(selectedChauffeur!);
          handleCloseDetails();
        }}
      />
    </Box>
  );
}
