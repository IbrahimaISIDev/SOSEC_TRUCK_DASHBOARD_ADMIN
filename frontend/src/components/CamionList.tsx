import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  styled,
  TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { useMemo } from 'react';
import type { Chauffeur } from '../types';
import type { Camion } from '../types';

// Styles personnalisés pour la table
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '0.85rem',
  },
}));

// Style pour les tooltips
const CustomTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.common.white,
    fontSize: '0.9rem',
    padding: theme.spacing(1),
  },
}));

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
  // Optimiser getChauffeurName avec useMemo
  const getChauffeurName = useMemo(() => {
    const chauffeurMap = new Map(chauffeurs.map(c => [c.id, c.nom]));
    return (driverId?: string) => {
      if (!driverId) return 'Non assigné';
      return chauffeurMap.get(driverId) || 'Non assigné';
    };
  }, [chauffeurs]);

  // Vérifier l'état de l'assurance
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

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      <Table aria-label="Tableau des camions">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <StyledTableCell>
              <strong>Nom</strong>
            </StyledTableCell>
            <StyledTableCell>
              <strong>Type</strong>
            </StyledTableCell>
            <StyledTableCell>
              <strong>Immatriculation</strong>
            </StyledTableCell>
            <StyledTableCell>
              <strong>Chauffeur assigné</strong>
            </StyledTableCell>
            <StyledTableCell>
              <strong>Expiration assurance</strong>
            </StyledTableCell>
            <StyledTableCell align="right">
              <strong>Actions</strong>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {camions.length === 0 ? (
            <TableRow>
              <StyledTableCell colSpan={6} align="center">
                Aucun camion disponible.
              </StyledTableCell>
            </TableRow>
          ) : (
            camions.map((camion) => {
              const assuranceStatus = getAssuranceStatus(camion.assuranceExpiration);
              return (
                <StyledTableRow key={camion.id}>
                  <StyledTableCell>{camion.nom}</StyledTableCell>
                  <StyledTableCell>{camion.type}</StyledTableCell>
                  <StyledTableCell>{camion.immatriculation || 'N/A'}</StyledTableCell>
                  <StyledTableCell>{getChauffeurName(camion.driverId)}</StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={assuranceStatus.label}
                      color={assuranceStatus.color as 'success' | 'warning' | 'error' | 'default'}
                      size="small"
                      icon={assuranceStatus.icon}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <CustomTooltip title="Modifier le camion">
                      <IconButton
                        aria-label="Modifier le camion"
                        onClick={() => handleEditCamion(camion)}
                        sx={{ color: 'primary.main', '&:hover': { color: 'primary.dark' } }}
                      >
                        <EditIcon />
                      </IconButton>
                    </CustomTooltip>
                    <CustomTooltip title="Supprimer le camion">
                      <IconButton
                        aria-label="Supprimer le camion"
                        onClick={() => handleDeleteCamion(camion.id)}
                        sx={{ color: 'error.main', '&:hover': { color: 'error.dark' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CustomTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCamions}
        rowsPerPage={pageSize}
        page={currentPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage="Camions par page :"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
      />
    </TableContainer>
  );
};

export default CamionsList;