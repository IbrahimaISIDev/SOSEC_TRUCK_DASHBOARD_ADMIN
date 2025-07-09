// NavBar.tsx
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Constante pour la hauteur de la barre de navigation
export const NAVBAR_HEIGHT = 64;

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (!user) return null;

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1, // S'assure que la NavBar est toujours au-dessus
          bgcolor: 'primary.main', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          height: NAVBAR_HEIGHT
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            L&N LOGISTICS
          </Typography>
          {isMobile ? (
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box>
              <Button
                color="inherit"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                sx={{ mx: 1, textTransform: 'none', fontWeight: 500 }}
              >
                Déconnexion
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={handleDrawerToggle}
        sx={{
          zIndex: theme.zIndex.drawer,
        }}
      >
        <Box sx={{ width: 250, bgcolor: 'background.paper', pt: `${NAVBAR_HEIGHT}px` }}>
          <List>
            <ListItem
              onClick={() => {
                logout();
                navigate('/login');
                setDrawerOpen(false);
              }}
            >
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      {/* Espace pour éviter que le contenu ne soit masqué sous la barre de navigation */}
      <Toolbar sx={{ minHeight: `${NAVBAR_HEIGHT}px !important` }} />
    </>
  );
}