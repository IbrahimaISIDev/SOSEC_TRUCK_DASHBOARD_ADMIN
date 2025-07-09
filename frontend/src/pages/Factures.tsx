import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Fade,
  Grow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PictureAsPdf,
  Add,
  Visibility,
  Search,
  TrendingUp,
  Receipt,
  AccountBalanceWallet,
  GetApp,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import { getFactures } from '../api/factureApi';
import { downloadPDF } from '../utils/generatePDF';
import type { Facture } from '../types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Factures() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openPDFDialog, setOpenPDFDialog] = useState(false);
  const [selectedPDFUrl, setSelectedPDFUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const data = await getFactures();
        setFactures(data);
      } catch (err: any) {
        setError('Impossible de charger les factures.');
      } finally {
        setLoading(false);
      }
    };
    fetchFactures();
  }, []);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Filtrer les factures
  const filteredFactures = factures.filter(facture => {
    const matchesSearch = facture.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facture.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || facture.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Statistiques
  const totalFactures = factures.length;
  const totalMontant = factures.reduce((sum, f) => sum + f.totalTTC, 0);
  const facturesPayees = factures.filter(f => f.statut === 'payée').length;
  const facturesEnAttente = factures.filter(f => f.statut === 'envoyée').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payée': return 'success';
      case 'envoyée': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'payée': return 'Payée';
      case 'envoyée': return 'Envoyée';
      default: return 'Brouillon';
    }
  };

  const handleViewPDF = (pdfUrl?: string) => {
    if (pdfUrl) {
      setSelectedPDFUrl(pdfUrl);
      setOpenPDFDialog(true);
      setPageNumber(1);
    } else {
      setError('URL du PDF non disponible pour cette facture.');
    }
  };

  const handleExportPDF = async (facture: Facture) => {
    try {
      await downloadPDF(facture);
    } catch (err: any) {
      setError('Erreur lors de l\'exportation du PDF.');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleClosePDFDialog = () => {
    setOpenPDFDialog(false);
    setSelectedPDFUrl(null);
    setNumPages(null);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Chargement des factures...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Error Alert */}
      {error && (
        <Fade in timeout={500}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          {/* Title and Action */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Gestion des Factures
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Gérez vos factures efficacement et suivez vos revenus
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/factures/nouvelle')}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: theme.shadows[8],
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[12],
                },
                transition: 'all 0.3s ease'
              }}
            >
              Nouvelle Facture
            </Button>
          </Stack>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={600}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: theme.palette.primary.main,
                        width: 56,
                        height: 56
                      }}>
                        <Receipt />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {totalFactures}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Factures
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={800}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: theme.palette.success.main,
                        width: 56,
                        height: 56
                      }}>
                        <AccountBalanceWallet />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {totalMontant.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total F CFA
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={1000}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: theme.palette.warning.main,
                        width: 56,
                        height: 56
                      }}>
                        <TrendingUp />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                          {facturesEnAttente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          En Attente
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={1200}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: theme.palette.info.main,
                        width: 56,
                        height: 56
                      }}>
                        <Receipt />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {facturesPayees}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Payées
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Search and Filter Section */}
      <Fade in timeout={1000}>
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3, 
          boxShadow: theme.shadows[4],
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
          backdropFilter: 'blur(10px)'
        }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Rechercher par client ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('all')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Toutes
              </Button>
              <Button
                variant={filterStatus === 'payée' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('payée')}
                color="success"
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Payées
              </Button>
              <Button
                variant={filterStatus === 'envoyée' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('envoyée')}
                color="warning"
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Envoyées
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={openPDFDialog}
        onClose={handleClosePDFDialog}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Aperçu de la Facture
        </DialogTitle>
        <DialogContent>
          {selectedPDFUrl && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Document
                file={selectedPDFUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={() => setError('Erreur lors du chargement du PDF.')}
                loading={<CircularProgress />}
              >
                <Page pageNumber={pageNumber} width={600} />
              </Document>
              {numPages && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber(pageNumber - 1)}
                    variant="outlined"
                  >
                    Précédent
                  </Button>
                  <Typography>
                    Page {pageNumber} sur {numPages}
                  </Typography>
                  <Button
                    disabled={pageNumber >= (numPages || 1)}
                    onClick={() => setPageNumber(pageNumber + 1)}
                    variant="outlined"
                  >
                    Suivant
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePDFDialog} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content Section */}
      <Fade in timeout={1200}>
        <Paper sx={{ 
          borderRadius: 3, 
          boxShadow: theme.shadows[6],
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: 'blur(20px)'
        }}>
          {error ? (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          ) : filteredFactures.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Receipt sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {searchTerm || filterStatus !== 'all' ? 'Aucune facture trouvée' : 'Aucune facture enregistrée'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par créer votre première facture'
                }
              </Typography>
              {!searchTerm && filterStatus === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/factures/nouvelle')}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Créer une facture
                </Button>
              )}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& th': { 
                    fontWeight: 'bold',
                    color: theme.palette.primary.dark
                  }
                }}>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Total TTC</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFactures.map((facture, index) => (
                  <Grow in timeout={300 + index * 100} key={facture.id}>
                    <TableRow sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        transform: 'scale(1.01)',
                      },
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {facture.numero}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(facture.date).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {facture.clientNom}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {facture.totalTTC.toLocaleString()} F CFA
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(facture.statut)}
                          color={getStatusColor(facture.statut)}
                          size="small"
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Voir la facture">
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => handleViewPDF(facture.pdfUrl)}
                                disabled={!facture.pdfUrl}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease',
                                  opacity: facture.pdfUrl ? 1 : 0.5
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Exporter en PDF">
                            <IconButton
                              color="secondary"
                              onClick={() => handleExportPDF(facture)}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Régénérer et télécharger PDF">
                            <IconButton
                              color="info"
                              onClick={() => handleExportPDF(facture)}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <GetApp />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </Grow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Fade>
    </Container>
  );
}