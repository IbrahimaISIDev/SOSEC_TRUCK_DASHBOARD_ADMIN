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
  TablePagination,
  Modal,
  IconButton as MuiIconButton,
} from '@mui/material';
import { styled, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Ajoute cette ligne
import CloseIcon from '@mui/icons-material/Close';
import { useMemo, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { Ticket, Chauffeur, Camion } from '../types';
import TicketDetailsDialog from './TicketDetailsDialog';

// Configurez le worker pour react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

const ModalContent = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  backgroundColor: (theme: any) => theme.palette.background.paper,
  boxShadow: 24,
  padding: (theme: any) => theme.spacing(4),
  borderRadius: (theme: any) => theme.shape.borderRadius * 2,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

interface TicketsListProps {
  tickets?: Ticket[];
  chauffeurs: Chauffeur[];
  camions: Camion[];
  handleDeleteTicket: (id: string) => void;
  currentPage: number;
  pageSize: number;
  totalTickets: number;
  handlePageChange: (event: unknown, newPage: number) => void;
  handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TicketsList = ({
  tickets = [],
  chauffeurs,
  camions,
  handleDeleteTicket,
  currentPage,
  pageSize,
  totalTickets,
  handlePageChange,
  handleRowsPerPageChange,
}: TicketsListProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  // Pour la modale de détails
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    console.log('TicketsList props:', { tickets, chauffeurs, camions });
  }, [tickets, chauffeurs, camions]);

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

  // Fonction pour extraire les données essentielles de extraData
  const parseExtraData = (ticket: Ticket) => {
    let extraData: { [key: string]: any } = {};
    try {
      if (typeof ticket.extraData === 'string') {
        extraData = JSON.parse(ticket.extraData || '{}');
      } else if (
        typeof ticket.extraData === 'object' &&
        ticket.extraData !== null
      ) {
        extraData = ticket.extraData;
      }
    } catch (e) {
      console.error('Erreur lors du parsing de extraData:', e);
    }
    const ticketNum =
      ticket.ticketNum ||
      extraData.ticket_number ||
      extraData.numero_ticket ||
      extraData['Numéro de Vente'] ||
      extraData.bon_approvisionnement_numero ||
      'N/A';

    const dateEntrance =
      ticket.dateEntrance ||
      extraData.entry_date ||
      extraData.date ||
      extraData.Date ||
      'N/A';

    const netWeight =
      ticket.netWeight ||
      extraData.net_weight ||
      extraData['Poids Net'] ||
      'N/A';

    return { ticketNum, dateEntrance, netWeight };
  };

  const handleViewDocument = (url: string) => {
    setSelectedDocument(url);
    setIsPdf(url.toLowerCase().endsWith('.pdf'));
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDocument(null);
    setNumPages(null);
  };

  const handleDownloadDocument = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Détails ticket
  const handleShowDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedTicket(null);
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
        <Table aria-label="Tableau des tickets">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <StyledTableCell>
                <strong>Numéro</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Type</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Chauffeur</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Camion</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Date Entrée</strong>
              </StyledTableCell>
              <StyledTableCell>
                <strong>Poids Net</strong>
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
            {tickets.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={8} align="center">
                  Aucun ticket disponible.
                </StyledTableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => {
                const syncStatusChip = getSyncStatusChip(
                  ticket.syncStatus || 'N/A'
                );
                const { ticketNum, dateEntrance, netWeight } =
                  parseExtraData(ticket);
                return (
                  <StyledTableRow key={ticket.id}>
                    <StyledTableCell>{ticketNum}</StyledTableCell>
                    <StyledTableCell>{ticket.type || 'N/A'}</StyledTableCell>
                    <StyledTableCell>
                      {getChauffeurName(ticket.driver)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {getCamionName(ticket.camionId ?? '')}
                    </StyledTableCell>
                    <StyledTableCell>
                      {dateEntrance !== 'N/A'
                        ? new Date(dateEntrance).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      {netWeight !== 'N/A' ? `${netWeight}` : 'N/A'}
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
                      <CustomTooltip title="Détails du ticket">
                        <IconButton
                          aria-label="Détails du ticket"
                          onClick={() => handleShowDetails(ticket)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { color: 'primary.dark' },
                          }}
                        >
                          <InfoOutlinedIcon />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Supprimer le ticket">
                        <IconButton
                          aria-label="Supprimer le ticket"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { color: 'error.dark' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CustomTooltip>
                      {ticket.imageUrl && (
                        <>
                          <CustomTooltip title="Télécharger le document">
                            <IconButton
                              aria-label="Télécharger le document"
                              onClick={() =>
                                handleDownloadDocument(ticket.imageUrl!)
                              }
                              sx={{
                                color: 'secondary.main',
                                '&:hover': { color: 'secondary.dark' },
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </CustomTooltip>
                          <CustomTooltip title="Voir le document">
                            <IconButton
                              aria-label="Voir le document"
                              onClick={() =>
                                handleViewDocument(ticket.imageUrl!)
                              }
                              sx={{
                                color: 'info.main',
                                '&:hover': { color: 'info.dark' },
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </CustomTooltip>
                        </>
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
          count={totalTickets}
          rowsPerPage={pageSize}
          page={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Tickets par page :"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} sur ${count}`
          }
        />
      </TableContainer>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalContent>
          <MuiIconButton
            onClick={handleCloseModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </MuiIconButton>
          {selectedDocument &&
            (isPdf ? (
              <Document
                file={selectedDocument}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) =>
                  console.error('Erreur de chargement du PDF:', error)
                }
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={1.0}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            ) : (
              <Box
                component="img"
                src={selectedDocument}
                alt="Document"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
            ))}
        </ModalContent>
      </Modal>
      <TicketDetailsDialog
        open={openDetails}
        ticket={selectedTicket}
        chauffeurs={chauffeurs}
        camions={camions}
        onClose={handleCloseDetails}
      />
    </>
  );
};

export default TicketsList;
