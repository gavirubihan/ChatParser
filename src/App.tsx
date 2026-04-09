import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { ChatViewer } from './pages/ChatViewer';
import { Privacy } from './pages/Privacy';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { CookieConsent } from './components/CookieConsent';
import { ScrollToTop } from './components/ScrollToTop';
import { useTheme } from './hooks/useTheme';
import { enforcePrivacyModeOnStartup } from './lib/privacyMode';

const ThemeInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
};

const App: React.FC = () => {
  const [ready, setReady] = useState(false);

  // On first load: enforce privacy/session mode (wipe data if session mode + fresh tab)
  useEffect(() => {
    enforcePrivacyModeOnStartup().finally(() => setReady(true));
  }, []);

  // Show nothing (or a tiny spinner) while the async startup runs
  if (!ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-base)',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border-default)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ThemeInitializer>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<ChatViewer />} />
          <Route path="/chat/:sessionId" element={<ChatViewer />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
        <ScrollToTop />
      </ThemeInitializer>
    </BrowserRouter>
  );
};

export default App;
