import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ExpensesList from '../components/ExpensesList';
import ExpenseForm from '../components/ExpenseForm';
import {
  getAllExpenses,
  updateExpense,
  deleteExpense,
} from '../api/expenseApi';
import { getAllChauffeurs } from '../api/userApi';
import type { Expense, Chauffeur, DecodedToken } from '../types';

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    severity: 'success' | 'error';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.role !== 'admin') {
        setError('Accès réservé aux administrateurs.');
        setLoading(false);
        return;
      }
      setIsAdmin(true);
    } catch (err) {
      console.error('Token Decoding Error:', err);
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [expensesResponse, chauffeursData] = await Promise.all([
          getAllExpenses(currentPage + 1, pageSize),
          getAllChauffeurs(),
        ]);
        console.log('Expenses Response:', {
          expenses: expensesResponse.expenses.map((e) => ({
            id: e.id,
            driverId: e.driverId,
            driverName: e.driverName,
            paymentMethod: e.paymentMethod,
            syncStatus: e.syncStatus,
          })),
          total: expensesResponse.total,
        });
        console.log(
          'Chauffeurs Data:',
          chauffeursData.map((c) => ({ id: c.id, nom: c.nom }))
        );
        setExpenses([...(expensesResponse.expenses || [])]);
        setTotalExpenses(expensesResponse.total || 0);
        setChauffeurs([
          ...(chauffeursData.filter((c) => c.role === 'driver') || []),
        ]);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch Error:', err);
        setError(err.message || 'Erreur lors du chargement des données.');
        setExpenses([]);
        setChauffeurs([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentPage, pageSize]);

  useEffect(() => {
    console.log(
      'Expenses state updated:',
      expenses.map((e) => ({
        id: e.id,
        driverId: e.driverId,
        driverName: e.driverName,
        paymentMethod: e.paymentMethod,
        syncStatus: e.syncStatus,
      }))
    );
  }, [expenses]);

  const handleEditExpense = (expense: Expense) => {
    setIsEditing(true);
    setFormData({
      id: expense.id,
      driverId: expense.driverId,
      type: expense.type,
      entryType: expense.entryType,
      date: expense.date,
      quantity: expense.quantity,
      amount: expense.amount,
      description: expense.description,
      location: expense.location,
      paymentMethod: expense.paymentMethod,
      imageUrl: expense.imageUrl,
      syncStatus: expense.syncStatus,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSubmit = async (data: Partial<Expense>) => {
    try {
      if (isEditing && formData.id) {
        const updatedExpense = await updateExpense(formData.id, data);
        setExpenses((prev) =>
          prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
        );
        setMessage({
          text: 'Dépense mise à jour avec succès.',
          severity: 'success',
        });
      } else {
        setMessage({
          text: "L'ajout de nouvelles dépenses est désactivé.",
          severity: 'error',
        });
        return;
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error('Submit Error:', err);
      setMessage({
        text: err.message || 'Erreur lors de la soumission de la dépense.',
        severity: 'error',
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) {
      try {
        await deleteExpense(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        setTotalExpenses((prev) => prev - 1);
        setMessage({
          text: 'Dépense supprimée avec succès.',
          severity: 'success',
        });
      } catch (err: any) {
        console.error('Delete Error:', err);
        setMessage({
          text: err.message || 'Erreur lors de la suppression de la dépense.',
          severity: 'error',
        });
      }
    }
  };

  const handleDownloadDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === 'quantity' || name === 'amount'
          ? parseFloat(value) || undefined
          : value,
    });
  };

  const handleSelectChange = (
    e: import('@mui/material').SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (field: string, date: Date | null) => {
    setFormData({ ...formData, [field]: date ? date.toISOString() : null });
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  console.log(
    'Rendering Expenses, expenses:',
    expenses.map((e) => ({
      id: e.id,
      driverId: e.driverId,
      driverName: e.driverName,
      paymentMethod: e.paymentMethod,
      syncStatus: e.syncStatus,
    })),
    'isAdmin:',
    isAdmin,
    'loading:',
    loading,
    'error:',
    error
  );

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!isAdmin) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Accès réservé aux administrateurs.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Dépenses
      </Typography>
      {message && (
        <Alert
          severity={message.severity}
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      <ExpensesList
        expenses={expenses}
        chauffeurs={chauffeurs}
        handleEditExpense={handleEditExpense}
        handleDeleteExpense={handleDeleteExpense}
        handleDownloadDocument={handleDownloadDocument}
        currentPage={currentPage}
        pageSize={pageSize}
        totalExpenses={totalExpenses}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ExpenseForm
        open={openDialog && isEditing}
        isEditing={isEditing}
        formData={formData}
        chauffeurs={chauffeurs}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleDateChange={handleDateChange}
        handleCloseDialog={handleCloseDialog}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};

export default Expenses;