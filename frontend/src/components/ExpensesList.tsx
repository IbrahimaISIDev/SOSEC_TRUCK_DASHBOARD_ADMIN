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
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEffect, useState } from 'react';
import type { Expense, Chauffeur } from '../types';
import ExpenseDetailsDialog from '../components/ExpenseDetailsDialog';

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

interface ExpensesListProps {
  expenses?: Expense[];
  chauffeurs: Chauffeur[];
  handleEditExpense: (expense: Expense) => void;
  handleDeleteExpense: (id: string) => void;
  handleDownloadDocument: (url: string) => void;
  currentPage: number;
  pageSize: number;
  totalExpenses: number;
  handlePageChange: (event: unknown, newPage: number) => void;
  handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExpensesList = ({
  expenses = [],
  chauffeurs,
  handleEditExpense,
  handleDeleteExpense,
  handleDownloadDocument,
  currentPage,
  pageSize,
  totalExpenses,
  handlePageChange,
  handleRowsPerPageChange,
}: ExpensesListProps) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    console.log('ExpensesList expenses:', expenses.map((e) => ({
      id: e.id,
      paymentMethod: e.paymentMethod,
      syncStatus: e.syncStatus,
    })));
  }, [expenses]);

  const getSyncStatusChip = (syncStatus: string) => {
    switch (syncStatus.toLowerCase()) {
      case 'synced':
        return { label: 'Synchronisé', color: 'success' };
      case 'pending':
        return { label: 'En attente', color: 'warning' };
      default:
        return { label: 'N/A', color: 'default' };
    }
  };

  const handleShowDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedExpense(null);
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
        <Table aria-label="Tableau des dépenses">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <StyledTableCell>
                <strong>Chauffeur</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Type</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Montant (FCFA)</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Date</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Mode de paiement</strong>
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
            {expenses.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={8} align="center">
                  Aucune dépense disponible.
                </StyledTableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => {
                const syncStatusChip = getSyncStatusChip(
                  expense.syncStatus || 'N/A'
                );
                return (
                  <StyledTableRow key={expense.id}>
                    <StyledTableCell>
                      {expense.driverName || 'Non assigné'}
                    </StyledTableCell>
                    <StyledTableCell>{expense.type || 'N/A'}</StyledTableCell>
                    <StyledTableCell>
                      {expense.amount ? expense.amount.toFixed(2) : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      {expense.date
                        ? new Date(expense.date).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      {expense.paymentMethod
                        ? expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1)
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
                          onClick={() => handleShowDetails(expense)}
                          sx={{
                            color: 'info.main',
                            '&:hover': { color: 'info.dark' },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Modifier la dépense">
                        <IconButton
                          aria-label="Modifier la dépense"
                          onClick={() => handleEditExpense(expense)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { color: 'primary.dark' },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Supprimer la dépense">
                        <IconButton
                          aria-label="Supprimer la dépense"
                          onClick={() => handleDeleteExpense(expense.id)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { color: 'error.dark' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CustomTooltip>
                      {expense.imageUrl && (
                        <CustomTooltip title="Télécharger le reçu">
                          <IconButton
                            aria-label="Télécharger le reçu"
                            onClick={() =>
                              handleDownloadDocument(expense.imageUrl!)
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
          count={totalExpenses}
          rowsPerPage={pageSize}
          page={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Dépenses par page :"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} sur ${count}`
          }
        />
      </TableContainer>
      <ExpenseDetailsDialog
        open={openDetails}
        expense={selectedExpense}
        onClose={handleCloseDetails}
      />
    </>
  );
};

export default ExpensesList;