import { Container, Typography } from '@mui/material';
import DocumentList from '../components/DocumentList'; // Adjust the path as needed

const mockDocuments = [
  { id: '1', name: 'Driver License', type: 'License', expirationDate: '2025-12-31' },
  { id: '2', name: 'Insurance', type: 'Insurance', expirationDate: '2025-06-30' },
];

export default function Documents() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>
      <DocumentList documents={mockDocuments} />
    </Container>
  );
}