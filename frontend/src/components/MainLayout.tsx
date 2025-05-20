// MainLayout.tsx
import { Box, Typography } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideBar from './SideBar';
import SIDEBAR_WIDTH from './SideBar';
import NavBar from './NavBar';
import NAVBAR_HEIGHT from './NavBar';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Documents from '../pages/Documents';
import Report from '../pages/Reports';
import Financials from '../pages/Financials';
import Notifications from '../pages/Notifications';
import Drivers from '../pages/Drivers';
import Camions from '../pages/Camions';
// import Trucks from '../pages/Trucks'; // Assurez-vous d'avoir cette page
// import Tickets from '../pages/Tickets'; // Assurez-vous d'avoir cette page

function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavBar = location.pathname === '/login' || location.pathname === '/';

  console.log('MainLayout', { user, location: location.pathname, hideNavBar });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* La NavBar est toujours en haut */}
      {user && !hideNavBar && <NavBar />}
      
      {/* Container pour le contenu principal et la sidebar */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* La Sidebar est placée à gauche */}
        {user && !hideNavBar && <SideBar />}
        
        {/* Zone de contenu principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            paddingTop: user && !hideNavBar ? `${NAVBAR_HEIGHT}px` : 0,
            marginLeft: user && !hideNavBar ? { xs: 0, md: `${SIDEBAR_WIDTH}px` } : 0,
            transition: 'margin-left 0.3s',
            bgcolor: 'background.default',
            minHeight: '100vh',
            // Éviter le padding double avec la barre de navigation
            position: 'relative',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/reports" element={<Report />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/drivers" element={<Drivers />} />
              {/* Ajout des nouvelles routes mentionnées dans la SideBar */}
              <Route path="/trucks" element={<Camions />} />
              {/* <Route path="/tickets" element={<Tickets />} /> */}
              <Route path="/" element={<Login />} />
              <Route path="*" element={<Typography>404 - Page non trouvée</Typography>} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;