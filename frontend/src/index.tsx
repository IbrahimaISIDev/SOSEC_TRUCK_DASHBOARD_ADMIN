import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppThemeProvider } from './context/ThemeContext';
import App from './App';

// Composant ErrorBoundary pour capturer les erreurs de rendu
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Une erreur est survenue.</h1>;
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);