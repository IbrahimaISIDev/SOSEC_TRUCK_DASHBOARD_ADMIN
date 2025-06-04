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
import { useState, useMemo, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { Mileage, Chauffeur, Camion } from '../types';
import MileageDetailsDialog from './MileageDetailsDialog';

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

interface MileageListProps {
  mileages?: Mileage[];
  chauffeurs: Chauffeur[];
  camions: Camion[];
  handleEditMileage: (mileage: Mileage) => void;
  handleDeleteMileage: (id: string) => void;
  handleDownloadDocument: (url: string) => void;
  currentPage: number;
  pageSize: number;
  totalMileages: number;
  handlePageChange: (event: unknown, newPage: number) => void;
  handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MileageList = ({
  mileages = [],
  chauffeurs,
  camions,
  handleEditMileage,
  handleDeleteMileage,
  handleDownloadDocument,
  currentPage,
  pageSize,
  totalMileages,
  handlePageChange,
  handleRowsPerPageChange,
}: MileageListProps) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedMileage, setSelectedMileage] = useState<Mileage | null>(null);

  useEffect(() => {
    console.log('MileageList props:', { mileages, chauffeurs, camions });
  }, [mileages, chauffeurs, camions]);

  const getChauffeurName = useMemo(() => {
    const chauffeurMap = new Map(chauffeurs.map((c) => [c.id, c.nom]));
    return (driverId: string) => chauffeurMap.get(driverId) || 'Non assigné';
  }, [chauffeurs]);

  const getCamionName = useMemo(() => {
    const camionMap = new Map(
      camions.map((c) => [c.id, c.nom || c.immatriculation || 'N/A'])
    );
    return (camionId: string) => camionMap.get(camionId) || 'Non assigné';
  }, [camions]);

  const getSyncStatusChip = (syncStatus: string) => {
    switch (syncStatus) {
      case 'synced':
        return { label: 'Synchronisé', color: 'success' };
      case 'local':
        return { label: 'Local', color: 'warning' };
      default:
        return { label: 'N/A', color: 'default' };
    }
  };

  const handleShowDetails = (mileage: Mileage) => {
    setSelectedMileage(mileage);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedMileage(null);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          overflowX: 'auto',
          maxWidth: '100%',
        }}
      >
        <Table aria-label="Tableau des kilométrages">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <StyledTableCell>
                <strong>Chauffeur</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Camion</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Date</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Distance (km)</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Statut Sync</strong>
              </StyledTableCell>
              <StyledTableCell align="right">
                <strong>Actions</strong>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mileages.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={7} align="center">
                  Aucun kilométrage disponible.
                </StyledTableCell>
              </TableRow>
            ) : (
              mileages.map((mileage) => {
                const syncStatusChip = getSyncStatusChip(
                  mileage.syncStatus || 'N/A'
                );
                return (
                  <StyledTableRow key={mileage.id}>
                    <StyledTableCell>
                      {getChauffeurName(mileage.driverId)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {getCamionName(mileage.camionId)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {mileage.date
                        ? new Date(mileage.date).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      {mileage.distance
                        ? `${mileage.distance.toFixed(2)} km`
                        : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        label={syncStatusChip.label}
                        color={
                          syncStatusChip.color as
                            | 'success'
                            | 'warning'
                            | 'default'
                        }
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <CustomTooltip title="Voir les détails">
                        <IconButton
                          aria-label="Voir les détails"
                          onClick={() => handleShowDetails(mileage)}
                          sx={{
                            color: 'info.main',
                            '&:hover': { color: 'info.dark' },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Modifier le kilométrage">
                        <IconButton
                          aria-label="Modifier le kilométrage"
                          onClick={() => handleEditMileage(mileage)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { color: 'primary.dark' },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Supprimer le kilométrage">
                        <IconButton
                          aria-label="Supprimer le kilométrage"
                          onClick={() => handleDeleteMileage(mileage.id)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { color: 'error.dark' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CustomTooltip>
                      {mileage.imageUrl && (
                        <CustomTooltip title="Télécharger le document">
                          <IconButton
                            aria-label="Télécharger le document"
                            onClick={() =>
                              handleDownloadDocument(mileage.imageUrl!)
                            }
                            sx={{
                              color: 'secondary.main',
                              '&:hover': { color: 'secondary.dark' },
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </CustomTooltip>
                      )}
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
          count={totalMileages}
          rowsPerPage={pageSize}
          page={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Kilométrages par page :"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} sur ${count}`
          }
        />
      </TableContainer>
      <MileageDetailsDialog
        open={openDetails}
        mileage={selectedMileage}
        chauffeurs={chauffeurs}
        camions={camions}
        onClose={handleCloseDetails}
      />
    </>
  );
};

export default MileageList;