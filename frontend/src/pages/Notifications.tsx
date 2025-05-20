import { Container, Typography } from '@mui/material';

export default function Notifications() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4">Notifications</Typography>
      <Typography color="text.secondary">Page en cours de développement</Typography>
    </Container>
  );
}