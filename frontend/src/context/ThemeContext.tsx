import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';

interface ThemeContextType {
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#1E3A8A', contrastText: '#FFFFFF' },
      secondary: { main: '#F59E0B' },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#1F2937',
        paper: mode === 'light' ? '#FFFFFF' : '#374151',
      },
    },
  });

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme doit être utilisé à l’intérieur d’un ThemeProvider');
  return context;
};