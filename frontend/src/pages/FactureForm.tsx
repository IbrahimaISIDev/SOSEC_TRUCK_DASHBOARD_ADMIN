import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Divider,
  Chip,
  Slider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaTruck } from 'react-icons/fa';
import { createFacture } from '../api/factureApi';
import { generatePDFBase64, downloadPDF } from '../utils/generatePDF';
import type { Facture } from '../types';

interface InvoicePreviewProps {
  $zoom: number;
}

const InvoicePreview = styled(motion.div)<InvoicePreviewProps>`
  background: linear-gradient(145deg, #ffffff, #f9fcff);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 32px;
  max-width: 595px;
  margin: 0 auto;
  font-family: 'Inter', 'Roboto', sans-serif;
  border: 1px solid #edf2f7;
  transform: scale(${(props) => props.$zoom});

  @media print {
    box-shadow: none;
    border: none;
    max-width: 100%;
    transform: scale(1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const ClientSection = styled.div`
  margin: 20px 0;
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
`;

const TableWrapper = styled.div`
  border: 1px solid #edf2f7;
  border-radius: 8px;
  overflow: hidden;
`;

const Totals = styled.div`
  margin-top: 20px;
  text-align: right;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
`;

const PaymentTerms = styled.div`
  margin-top: 20px;
  font-size: 12px;
  color: #718096;
  line-height: 1.5;
`;

const Footer = styled.div`
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #718096;
  font-weight: 500;
`;

const FormPaper = styled(Paper)`
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background: #ffffff;
`;

export default function FactureForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [zoom, setZoom] = useState(1);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Partial<Facture>>({
    numero: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    clientNom: '',
    clientAdresse: '',
    clientTelephone: '',
    clientEmail: '',
    societeNom: 'Lepp Diam',
    societeAdresse: 'LOT 137 Mam',
    societeSiret: '',
    lignes: [
      {
        designation: '',
        quantite: 1,
        prixUnitaire: 0,
        totalLigne: 0,
        poids: '',
        destination: '',
      },
    ],
    totalHT: 0,
    tva: 20,
    totalTTC: 0,
    commentaire: '',
    statut: 'brouillon',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLigneChange = (index: number, field: string, value: any) => {
    const newLignes = [...(formData.lignes || [])];
    newLignes[index] = { ...newLignes[index], [field]: value };
    if (field === 'quantite' || field === 'prixUnitaire') {
      newLignes[index].totalLigne =
        (newLignes[index].quantite || 0) * (newLignes[index].prixUnitaire || 0);
    }
    const totalHT = newLignes.reduce(
      (sum, ligne) => sum + (ligne.totalLigne || 0),
      0
    );
    const totalTTC = totalHT * (1 + (formData.tva || 0) / 100);
    setFormData((prev) => ({ ...prev, lignes: newLignes, totalHT, totalTTC }));
  };

  const addLigne = () => {
    setFormData((prev) => ({
      ...prev,
      lignes: [
        ...(prev.lignes || []),
        {
          designation: '',
          quantite: 1,
          prixUnitaire: 0,
          totalLigne: 0,
          poids: '',
          destination: '',
        },
      ],
    }));
  };

  const removeLigne = (index: number) => {
    const newLignes = (formData.lignes || []).filter((_, i) => i !== index);
    const totalHT = newLignes.reduce(
      (sum, ligne) => sum + (ligne.totalLigne || 0),
      0
    );
    const totalTTC = totalHT * (1 + (formData.tva || 0) / 100);
    setFormData((prev) => ({ ...prev, lignes: newLignes, totalHT, totalTTC }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    try {
      const pdfBase64 = await generatePDFBase64(formData as Facture);
      await createFacture(formData as Facture, pdfBase64);
      navigate('/factures');
    } catch (err: any) {
      if (err.response?.status === 413) {
        setErrors(['Fichier PDF trop volumineux. Essayez de réduire la qualité ou la taille de la facture.']);
      } else if (err.response?.status === 401) {
        setErrors(['Authentification requise. Veuillez vous connecter.']);
      } else if (err.response?.status === 403) {
        setErrors([
          'Accès interdit. Seuls les administrateurs peuvent créer des factures.',
        ]);
      } else if (err.response?.status === 404) {
        setErrors([
          'Endpoint API introuvable. Vérifiez la configuration du serveur.',
        ]);
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([err.message || 'Erreur lors de la création de la facture']);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      await downloadPDF(formData as Facture);
    } catch (error) {
      setErrors(["Erreur lors de l'exportation en PDF. Veuillez réessayer."]);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <FormPaper>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 700, color: '#1a3c6d' }}
            >
              Nouvelle Facture
            </Typography>
            {errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, color: '#2b6cb0' }}
                  >
                    Informations Facture
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Numéro de facture"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, color: '#2b6cb0' }}
                  >
                    Informations Client
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nom du client"
                    name="clientNom"
                    value={formData.clientNom}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Adresse du client"
                    name="clientAdresse"
                    value={formData.clientAdresse}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="clientTelephone"
                    value={formData.clientTelephone}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    type="email"
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1, color: '#2b6cb0' }}
                  >
                    Lignes de Facture
                  </Typography>
                  <TableWrapper>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7fafc' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#1a3c6d' }}>
                            Poids
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1a3c6d' }}>
                            Désignation
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1a3c6d' }}>
                            Destination
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, color: '#1a3c6d' }}
                          >
                            Quantité
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, color: '#1a3c6d' }}
                          >
                            Prix Unitaire (F)
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, color: '#1a3c6d' }}
                          >
                            Total (F)
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#1a3c6d' }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.lignes?.map((ligne, index) => (
                          <TableRow
                            key={index}
                            sx={{ '&:hover': { backgroundColor: '#edf2f7' } }}
                          >
                            <TableCell>
                              <TextField
                                fullWidth
                                value={ligne.poids || ''}
                                onChange={(e) =>
                                  handleLigneChange(
                                    index,
                                    'poids',
                                    e.target.value
                                  )
                                }
                                variant="standard"
                                placeholder="e.g., 75,740 T"
                                InputProps={{ disableUnderline: true }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={ligne.designation}
                                onChange={(e) =>
                                  handleLigneChange(
                                    index,
                                    'designation',
                                    e.target.value
                                  )
                                }
                                required
                                variant="standard"
                                placeholder="e.g., Transport d'huile"
                                InputProps={{ disableUnderline: true }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={ligne.destination || ''}
                                onChange={(e) =>
                                  handleLigneChange(
                                    index,
                                    'destination',
                                    e.target.value
                                  )
                                }
                                variant="standard"
                                placeholder="e.g., PORT - SENICO"
                                InputProps={{ disableUnderline: true }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                value={ligne.quantite}
                                onChange={(e) =>
                                  handleLigneChange(
                                    index,
                                    'quantite',
                                    Number(e.target.value)
                                  )
                                }
                                required
                                variant="standard"
                                inputProps={{ min: 1 }}
                                InputProps={{ disableUnderline: true }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="number"
                                value={ligne.prixUnitaire}
                                onChange={(e) =>
                                  handleLigneChange(
                                    index,
                                    'prixUnitaire',
                                    Number(e.target.value)
                                  )
                                }
                                required
                                variant="standard"
                                inputProps={{ min: 0, step: '0.01' }}
                                InputProps={{ disableUnderline: true }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {(ligne.totalLigne || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => removeLigne(index)}
                                disabled={formData.lignes?.length === 1}
                              >
                                <DeleteIcon sx={{ color: '#e53e3e' }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableWrapper>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addLigne}
                    sx={{ mt: 2, color: '#2b6cb0', fontWeight: 600 }}
                  >
                    Ajouter une ligne
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="TVA (%)"
                    name="tva"
                    type="number"
                    value={formData.tva}
                    onChange={(e) => {
                      const tva = Number(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        tva,
                        totalTTC: (prev.totalHT || 0) * (1 + tva / 100),
                      }));
                    }}
                    required
                    variant="outlined"
                    inputProps={{ min: 0, step: '0.1' }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Commentaires"
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: '#1a3c6d' }}
                  >
                    Total HT: {(formData.totalHT || 0).toFixed(2)} F
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: '#1a3c6d', mt: 1 }}
                  >
                    Total TTC: {(formData.totalTTC || 0).toFixed(2)} F
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mr: 2,
                      borderRadius: 8,
                      background: '#2b6cb0',
                      '&:hover': { background: '#1a4971' },
                    }}
                  >
                    Créer la facture
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{
                      mr: 2,
                      borderRadius: 8,
                      color: '#2b6cb0',
                      borderColor: '#2b6cb0',
                    }}
                  >
                    Imprimer
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPDF}
                    sx={{
                      borderRadius: 8,
                      color: '#2b6cb0',
                      borderColor: '#2b6cb0',
                    }}
                  >
                    Exporter en PDF
                  </Button>
                </Grid>
              </Grid>
            </form>
          </FormPaper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              position: 'sticky',
              top: 20,
              background: '#f9fcff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: '#1a3c6d' }}
              >
                Aperçu de la Facture
              </Typography>
              <Box>
                <IconButton
                  onClick={() => setShowPreview(!showPreview)}
                  sx={{ mr: 1 }}
                >
                  {showPreview ? (
                    <VisibilityOffIcon sx={{ color: '#2b6cb0' }} />
                  ) : (
                    <VisibilityIcon sx={{ color: '#2b6cb0' }} />
                  )}
                </IconButton>
                <IconButton onClick={() => setZoom(zoom === 1 ? 1.2 : 1)}>
                  <ZoomInIcon sx={{ color: '#2b6cb0' }} />
                </IconButton>
              </Box>
            </Box>
            {showPreview && (
              <InvoicePreview
                ref={invoiceRef}
                $zoom={zoom}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Header>
                  <Box>
                    <img
                      src="/assets/logistics.jpeg"
                      alt="L&N Logistics Logo"
                      style={{
                        height: '60px',
                        width: 'auto',
                        marginBottom: '8px',
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ mt: 2, fontWeight: 700, color: '#1a3c6d' }}
                    >
                      L&N LOGISTICS
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#718096', lineHeight: 1.6 }}
                    >
                      LOT 37 MERMOZ
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#718096', lineHeight: 1.6 }}
                    >
                      Tél: 78 879 98 67 / 77 634 45 68
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#718096', lineHeight: 1.6 }}
                    >
                      Email: llogistsn@gmail.com
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: '#2b6cb0' }}
                    >
                      Facture {formData.numero || 'INV-XXXX'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#718096', mt: 1 }}
                    >
                      Date:{' '}
                      {formData.date
                        ? new Date(formData.date).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </Typography>
                    <Chip
                      label={formData.statut || 'Brouillon'}
                      color={
                        formData.statut === 'payée'
                          ? 'success'
                          : formData.statut === 'envoyée'
                            ? 'warning'
                            : 'primary'
                      }
                      size="small"
                      sx={{
                        mt: 2,
                        background:
                          formData.statut === 'brouillon'
                            ? '#e6f3ff'
                            : undefined,
                        color: '#1a3c6d',
                      }}
                    />
                  </Box>
                </Header>

                <ClientSection>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: '#1a3c6d', mb: 1 }}
                  >
                    Facture à
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, color: '#2d3748' }}
                  >
                    {formData.clientNom || 'Nom du Client'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#718096', lineHeight: 1.6 }}
                  >
                    {formData.clientAdresse || 'Adresse du Client'}
                  </Typography>
                  {formData.clientTelephone && (
                    <Typography
                      variant="body2"
                      sx={{ color: '#718096', lineHeight: 1.6 }}
                    >
                      Tél: {formData.clientTelephone}
                    </Typography>
                  )}
                  {formData.clientEmail && (
                    <Typography
                      variant="body2"
                      sx={{ color: '#718096', lineHeight: 1.6 }}
                    >
                      Email: {formData.clientEmail}
                    </Typography>
                  )}
                </ClientSection>
                <Divider sx={{ my: 2, borderColor: '#edf2f7' }} />

                <TableWrapper>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f7fafc' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1a3c6d' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FaTruck style={{ marginRight: 8 }} /> Poids
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1a3c6d' }}>
                          Désignation
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1a3c6d' }}>
                          Destination
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, color: '#1a3c6d' }}
                        >
                          Prix Unitaire (F)
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, color: '#1a3c6d' }}
                        >
                          Montant Total (F)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.lignes?.map((ligne, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': { backgroundColor: '#edf2f7' },
                            backgroundColor:
                              index % 2 === 0 ? '#ffffff' : '#f9fcff',
                          }}
                        >
                          <TableCell sx={{ color: '#2d3748' }}>
                            {ligne.poids || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: '#2d3748' }}>
                            {ligne.designation || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: '#2d3748' }}>
                            {ligne.destination || 'N/A'}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#2d3748' }}>
                            {(ligne.prixUnitaire || 0).toFixed(2)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: '#2d3748', fontWeight: 500 }}
                          >
                            {(ligne.totalLigne || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableWrapper>

                <Totals>
                  <Typography variant="body1" sx={{ color: '#2d3748' }}>
                    Total HT: {(formData.totalHT || 0).toFixed(2)} F
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#2d3748', mt: 1 }}>
                    TVA ({formData.tva || 0}%):{' '}
                    {(
                      ((formData.totalHT || 0) * (formData.tva || 0)) / 100 || 0
                    ).toFixed(2)}{' '}
                    F
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: '#2b6cb0', mt: 2 }}
                  >
                    Total TTC: {(formData.totalTTC || 0).toFixed(2)} F
                  </Typography>
                </Totals>

                <PaymentTerms>
                  <Typography variant="body2">
                    Tous les chèques doivent être libellés à l'ordre de L&N
                    LOGISTICS / MOHAMED LEE.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Montant dû dans les 15 jours. Les comptes en retard sont
                    soumis à des frais de 3% par mois.
                  </Typography>
                </PaymentTerms>

                {formData.commentaire && (
                  <Box
                    sx={{ mt: 3, p: 2, background: '#f7fafc', borderRadius: 8 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: '#1a3c6d', mb: 1 }}
                    >
                      Commentaires
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096' }}>
                      {formData.commentaire}
                    </Typography>
                  </Box>
                )}

                <Footer>
                  <Typography variant="body2">
                    Merci pour votre confiance !{' '}
                    <FaTruck
                      style={{ marginLeft: 8, verticalAlign: 'middle' }}
                    />
                  </Typography>
                </Footer>
              </InvoicePreview>
            )}
            {showPreview && (
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" sx={{ mr: 2, color: '#718096' }}>
                  Zoom
                </Typography>
                <Slider
                  value={zoom}
                  min={0.8}
                  max={1.5}
                  step={0.1}
                  onChange={(e, value) => setZoom(value as number)}
                  sx={{ width: 150, color: '#2b6cb0' }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}