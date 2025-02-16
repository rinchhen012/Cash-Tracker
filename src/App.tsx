import { MantineProvider, createTheme } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import History from './pages/History';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import { checkSupabaseConnection } from './config/supabase';
import '@mantine/core/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
    blue: [
      '#E7F5FF',
      '#D0EBFF',
      '#A5D8FF',
      '#74C0FC',
      '#4DABF7',
      '#339AF0',
      '#228BE6',
      '#1C7ED6',
      '#1971C2',
      '#1864AB',
    ],
  },
  components: {
    Paper: {
      defaultProps: {
        bg: 'dark.7'
      }
    },
    Button: {
      defaultProps: {
        color: 'blue.7'
      }
    }
  }
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          setConnectionError('Unable to connect to the database. Please check your internet connection and try again.');
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setConnectionError('An error occurred while initializing the app.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (connectionError) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <ErrorBoundary>
          <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(45deg, var(--mantine-color-dark-8), var(--mantine-color-dark-9))',
            padding: 'var(--mantine-spacing-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              maxWidth: '400px',
              padding: '2rem',
              backgroundColor: 'var(--mantine-color-dark-7)',
              borderRadius: 'var(--mantine-radius-md)',
              border: '1px solid var(--mantine-color-dark-4)'
            }}>
              <h2 style={{ color: 'var(--mantine-color-red-6)', marginBottom: '1rem' }}>
                Connection Error
              </h2>
              <p style={{ color: 'var(--mantine-color-gray-4)' }}>
                {connectionError}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--mantine-color-blue-7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--mantine-radius-sm)',
                  cursor: 'pointer'
                }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        </ErrorBoundary>
      </MantineProvider>
    );
  }

  return (
    <ErrorBoundary>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Router future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true 
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator/:driverId" element={<Calculator />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Router>
        <SpeedInsights />
      </MantineProvider>
    </ErrorBoundary>
  );
};

export default App; 