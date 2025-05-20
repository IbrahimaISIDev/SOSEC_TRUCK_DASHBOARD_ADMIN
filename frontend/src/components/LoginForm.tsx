import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Fade,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/authApi';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await login(email, password);
      if (user.role !== 'admin') {
        throw new Error('Seuls les administrateurs peuvent se connecter');
      }
      authLogin(user, token); // <-- Passe bien les deux arguments
      onSuccess();
    } catch (err) {
      setError('Email ou mot de passe invalide, ou non administrateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={800}>
      <Card
        sx={{
          maxWidth: 450,
          p: 4,
          mx: 'auto',
          mt: 8,
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #2563EB, #3B82F6, #60A5FA)',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img
            src="/logo.png"
            alt="Saraya Tech Logo"
            style={{
              width: '140px',
              marginBottom: '20px',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #1E3A8A, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Saraya Tech Portal
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              fontWeight: 400,
              fontSize: '1rem',
              opacity: 0.8,
            }}
          >
            Connectez-vous en tant qu’administrateur
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 2,
            '& .MuiTextField-root': { mb: 2.5 },
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '8px',
                fontSize: '0.95rem',
                '& .MuiAlert-icon': { alignItems: 'center' },
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
              }}
            >
              {error}
            </Alert>
          )}

          <TextField
            label="Adresse email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            autoFocus
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: '10px',
                backgroundColor: 'background.paper',
                '&:hover': {
                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.25)',
                },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: '10px',
                backgroundColor: 'background.paper',
                '&:hover': {
                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.25)',
                },
              },
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 1,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '10px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                transform: 'translateY(-1px)',
              },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Se connecter'
            )}
          </Button>

          <Divider sx={{ my: 3, opacity: 0.6 }} />
        </Box>
      </Card>
    </Fade>
  );
}
