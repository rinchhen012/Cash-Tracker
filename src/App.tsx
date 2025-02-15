import { MantineProvider, createTheme } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import History from './pages/History';
import ErrorBoundary from './components/ErrorBoundary';
import '@mantine/core/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  components: {
    Paper: {
      defaultProps: {
        bg: 'dark.7'
      }
    },
    Button: {
      defaultProps: {
        color: 'blue.4'
      }
    }
  }
});

const App = () => {
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