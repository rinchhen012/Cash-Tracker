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