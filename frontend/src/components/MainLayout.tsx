import { Box, Typography } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideBar from './SideBar';
import SIDEBAR_WIDTH from './SideBar';
import NavBar from './NavBar';
import NAVBAR_HEIGHT from './NavBar';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Financials from '../pages/Financials';
import Notifications from '../pages/Notifications';
import Drivers from '../pages/Drivers';
import Camions from '../pages/Camions';
import Mileages from '../pages/Mileages';
import Tickets from '../pages/Tickets';
import Expenses from '../pages/Expenses';
import NotificationsPage from '../pages/Notifications';
import FactureForm from '../pages/FactureForm';
import Factures from '../pages/Factures';


function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavBar =
    location.pathname === '/login' || location.pathname === '/';

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
            marginLeft:
              user && !hideNavBar ? { xs: 0, md: `${SIDEBAR_WIDTH}px` } : 0,
            transition: 'margin-left 0.3s',
            bgcolor: 'background.default',
            minHeight: 'calc(100vh - 64px)', // Adjusted to fill space
            padding: 2, // Increased padding to reduce white space
            position: 'relative',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/mileages" element={<Mileages />} />
              <Route path="/trucks" element={<Camions />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/factures" element={<Factures />} />
              <Route path="/factures/nouvelle" element={<FactureForm />} />
              <Route path="/" element={<Login />} />
              <Route
                path="*"
                element={<Typography>404 - Page non trouvée</Typography>}
              />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
