// Login.tsx
import { Box } from '@mui/material';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
        position: 'relative',
        px: 2,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '120%',
          height: '120%',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 20%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.12) 0%, transparent 20%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 30%)
          `,
          top: '-10%',
          left: '-10%',
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
        }}
      >
        <LoginForm onSuccess={handleSuccess} />
      </Box>
    </Box>
  );
}
