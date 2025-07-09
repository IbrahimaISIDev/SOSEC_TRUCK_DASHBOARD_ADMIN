import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAVBAR_HEIGHT } from './NavBar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Ajoute cette ligne pour l'icône facture

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 60;

export default function SideBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Documents', path: '/documents', icon: <DescriptionIcon /> },
    { label: 'Dépenses', path: '/expenses', icon: <AttachMoneyIcon /> },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: <NotificationsIcon />,
    },
    { label: 'Chauffeurs', path: '/drivers', icon: <PersonIcon /> },
    { label: 'Camions', path: '/trucks', icon: <TruckIcon /> },
    { label: 'Tickets', path: '/tickets', icon: <AssessmentIcon /> },
    { label: 'Factures', path: '/factures', icon: <ReceiptLongIcon /> }, // Ajoute cette ligne pour le menu Factures

    { label: 'Rapports', path: '/reports', icon: <AssessmentIcon /> },
    { label: 'Kilométrage', path: '/mileages', icon: <AssessmentIcon /> },
  ];

  const handleToggle = () => {
    setOpen(!open);
  };

  if (!user) return null;

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            top: NAVBAR_HEIGHT + 8,
            left: 16,
            zIndex: theme.zIndex.drawer - 1,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={isMobile ? handleToggle : undefined}
        sx={{
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'primary.main',
            color: 'white',
            transition: 'width 0.3s',
            overflowX: 'hidden',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            marginTop: `${NAVBAR_HEIGHT}px`,
            height: `calc(100% - ${NAVBAR_HEIGHT}px)`,
            position: 'fixed',
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-end' : 'center',
          }}
        >
          <IconButton onClick={handleToggle} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.dark' },
                py: 1,
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              {open && <ListItemText primary={item.label} />}
            </ListItem>
          ))}
        </List>
      </Drawer>
      {!isMobile && (
        <Box sx={{ width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH }} />
      )}
    </>
  );
}
