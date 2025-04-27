import type { AppProps } from 'next/app';
import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import themeBase from '../src/theme';
import AppShell from '../src/components/AppShell';
import { useRouter } from 'next/router';
import { supabase } from '../src/utils/supabaseClient';
import PinLockGate from './_pinLock';

// Theme context for switching
export const ThemeKeyContext = createContext<{ themeKey: string; setThemeKey: (key: string) => void }>({ themeKey: 'light', setThemeKey: () => {} });

export default function MyApp({ Component, pageProps }: AppProps) {
  const [themeKey, setThemeKey] = useState('light');
  const router = useRouter();

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('themeKey') : null;
    if (stored) setThemeKey(stored);
  }, []);

  // Theme palette map
  const themePalettes: Record<string, any> = {
    light: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#388e3c' },
      background: { default: '#f5f7fb', paper: '#fff' },
      text: { primary: '#181c23', secondary: '#4f5b62' },
      divider: '#e3e8f3',
    },
    dark: {
      mode: 'dark',
      primary: { main: '#00c6ff' },
      secondary: { main: '#23272f' },
      background: { default: '#181c23', paper: '#23272f' },
      text: { primary: '#fff', secondary: '#b0b3b8' },
      divider: '#333b44',
    },
    blue: {
      mode: 'light',
      primary: { main: '#2196f3' },
      secondary: { main: '#1565c0' },
      background: { default: '#e3f0ff', paper: '#ffffff' },
      text: { primary: '#0d223a', secondary: '#3b5ba7' },
      divider: '#b6d4fa',
    },
    green: {
      mode: 'light',
      primary: { main: '#43a047' },
      secondary: { main: '#00695c' },
      background: { default: '#e9fbe5', paper: '#ffffff' },
      text: { primary: '#1a3c1a', secondary: '#387e3a' },
      divider: '#b6e7c9',
    },
    purple: {
      mode: 'light',
      primary: { main: '#8e24aa' },
      secondary: { main: '#512da8' },
      background: { default: '#f3e6fa', paper: '#ffffff' },
      text: { primary: '#3a1a4f', secondary: '#8e24aa' },
      divider: '#e1c6f7',
    },
  };

  const theme = useMemo(() => createTheme({
    ...themeBase,
    palette: themePalettes[themeKey] || themePalettes.light,
  }), [themeKey]);

  // Only use AppShell for authenticated pages (not login)
  const inAuth = router.pathname === '/';

  return (
    <ThemeKeyContext.Provider value={{ themeKey, setThemeKey }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {inAuth ? (
          <Component {...pageProps} />
        ) : (
          <PinLockGate>
            <AppShell>
              <Component {...pageProps} />
            </AppShell>
          </PinLockGate>
        )}
      </ThemeProvider>
    </ThemeKeyContext.Provider>
  );
}
