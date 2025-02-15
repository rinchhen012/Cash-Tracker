import { MantineProvider, createTheme } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        withBorder: true,
        p: 'xl',
        radius: 'md'
      }
    },
    Button: {
      defaultProps: {
        color: 'blue'
      }
    }
  }
});

const App = () => {
  return (
    <ErrorBoundary>
      <MantineProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator/:driverId" element={<Calculator />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Router>
      </MantineProvider>
    </ErrorBoundary>
  );
};

export default App; 