import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Alert, Slide } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import { ColorModeContextProvider, useThemeMode } from './context/ThemeContext';
import SessionsPage from './components/session/SessionsPage';
import OptimizerSessionsPage from './components/session/OptimizerSessionsPage';
import MaskViewer from './components/MaskViewer';
import { SessionProvider } from './context/SessionContext';
import { OptimizerProvider } from './context/OptimizerContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

import { Box } from '@mui/material';
import Footer from './components/Footer';
import { SnackbarProvider } from 'notistack';
import ConvergencePage from './components/ConvergencePage';

import { sendPing } from './api/HealthApi';

function AppContent() {
  const { theme } = useThemeMode();
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  

  useEffect(() => {
    const updateStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    let lastSent = 0;
    const MIN_INTERVAL = 10 * 60 * 1000;

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastSent > MIN_INTERVAL) {
        console.log("PING - Sending ping to keep backend alive...");
        sendPing();
        lastSent = now;
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, handleUserActivity));

    return () => {
      events.forEach(e => window.removeEventListener(e, handleUserActivity));
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Router>
          <Navbar />

          <Slide direction="down" in={isOffline} mountOnEnter unmountOnExit>
            <Alert severity="error" sx={{ borderRadius: 0, justifyContent: 'center', textAlign: 'center' }}>
              {t('offline_message')}
            </Alert>
          </Slide>

          <Box flexGrow={1}>
            <Routes>
              <Route path="/" element={<Navigate to="/viewer" replace />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/optimizerSessions" element={<OptimizerSessionsPage />} />

              <Route path="/viewer" element={<MaskViewer />} />
              <Route path="/convergence" element={<ConvergencePage />} />
            </Routes>
          </Box>
        </Router>
        <Footer />
      </Box>

    </ThemeProvider>
  );
}

function App() {
  return (
    <ColorModeContextProvider>
      <SessionProvider>
        <OptimizerProvider>
          <LanguageProvider>
            <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
              <AppContent />
            </SnackbarProvider>
          </LanguageProvider>
        </OptimizerProvider>
      </SessionProvider>
    </ColorModeContextProvider>
  );
}

export default App;