import {
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import type { Chauffeur, Camion } from '../types';

interface CamionsListProps {
  camions: Camion[];
  chauffeurs: Chauffeur[];
  handleEditCamion: (camion: Camion) => void;
  handleDeleteCamion: (id: string) => void;
  currentPage: number;
  pageSize: number;
  totalCamions: number;
  handlePageChange: (event: unknown, newPage: number) => void;
  handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const getAssuranceStatus = (expiration?: string) => {
  if (!expiration) return { label: 'N/A', color: 'default' };
  const expDate = new Date(expiration);
  const today = new Date();
  const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  if (daysLeft <= 0) {
    return { label: `Expirée (${-daysLeft} jours)`, color: 'error', icon: <WarningIcon fontSize="small" /> };
  }
  if (daysLeft <= 30) {
    return { label: `Expire bientôt (${daysLeft} jours)`, color: 'warning', icon: <WarningIcon fontSize="small" /> };
  }
  return { label: expDate.toLocaleDateString('fr-FR'), color: 'success' };
};

const CamionsList = ({
  camions,
  chauffeurs,
  handleEditCamion,
  handleDeleteCamion,
  currentPage,
  pageSize,
  totalCamions,
  handlePageChange,
  handleRowsPerPageChange,
}: CamionsListProps) => {
  const [searchText, setSearchText] = useState('');

  const chauffeurMap = useMemo(() => {
    return new Map(chauffeurs.map((c) => [c.id, c.nom]));
  }, [chauffeurs]);

  const filteredCamions = useMemo(() => {
    if (!searchText) return camions;
    const lower = searchText.toLowerCase();
    return camions.filter(
      (c) =>
        c.nom?.toLowerCase().includes(lower) ||
        c.type?.toLowerCase().includes(lower) ||
        c.immatriculation?.toLowerCase().includes(lower) ||
        (c.driverId && chauffeurMap.get(c.driverId)?.toLowerCase().includes(lower))
    );
  }, [camions, searchText, chauffeurMap]);

  const columns: GridColDef[] = [
    {
      field: 'nom',
      headerName: 'Nom',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'immatriculation',
      headerName: 'Immatriculation',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => params.value || 'N/A',
    },
    {
      field: 'driverId',
      headerName: 'Chauffeur assigné',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? chauffeurMap.get(params.value) : 'Non assigné',
      filterable: true,
    },
    {
      field: 'assuranceExpiration',
      headerName: "Expiration assurance",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        const status = getAssuranceStatus(params.value);
        return (
          <Chip
            label={status.label}
            color={status.color as 'success' | 'warning' | 'error' | 'default'}
            size="small"
            icon={status.icon}
            sx={{ fontWeight: 'medium' }}
          />
        );
      },
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="Modifier le camion">
            <IconButton
              aria-label="Modifier le camion"
              onClick={() => handleEditCamion(params.row)}
              sx={{ color: 'primary.main', '&:hover': { color: 'primary.dark' } }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer le camion">
            <IconButton
              aria-label="Supprimer le camion"
              onClick={() => handleDeleteCamion(params.row.id)}
              sx={{ color: 'error.main', '&:hover': { color: 'error.dark' } }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, p: 3 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Liste des camions
      </Typography>
      <Box sx={{ mb: 2 }}>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: '1px solid #ccc',
            width: 250,
            fontSize: 16,
          }}
        />
      </Box>
      <Box sx={{ height: 500, bgcolor: 'white', borderRadius: 1 }}>
        <DataGrid
          rows={filteredCamions}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
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
    </Box>
  );
};

export default CamionsList;