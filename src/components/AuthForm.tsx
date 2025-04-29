import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Tabs, Tab, Divider, IconButton, InputAdornment, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon } from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';

export default function AuthForm({ onAuth }: { onAuth: () => void }) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Remember Me: Load email from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('chatify_email');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleTab = (_: any, newTab: number) => setTab(newTab);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    if (rememberMe) localStorage.setItem('chatify_email', email);
    else localStorage.removeItem('chatify_email');
    let resp;
    if (tab === 0) {
      resp = await supabase.auth.signInWithPassword({ email, password });
      if (resp.error) {
        setError(resp.error.message);
      } else if (!resp.data.session?.user?.email_confirmed_at && !resp.data.session?.user?.confirmed_at) {
        setError('Please confirm your email address before continuing.');
      } else {
        onAuth();
      }
    } else {
      resp = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: "https://massage-pi.vercel.app/"
  }
});
      if (resp.error) {
        setError(resp.error.message);
      } else {
        setInfo('Registration successful! Please confirm your email address before logging in.');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="transparent">
      <Paper elevation={8} sx={{
        p: { xs: 3, sm: 5 },
        minWidth: { xs: 320, sm: 390 },
        maxWidth: 420,
        borderRadius: 7,
        boxShadow: '0 12px 40px #1976d250, 0 2px 12px #00c6ff33',
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '2.5px solid rgba(25,118,210,0.12)',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 16px 48px #00c6ff77, 0 4px 20px #1976d2AA',
          borderColor: '#00c6ff88',
        },
        mt: 0
      }}>
        <Box sx={{ mb: 1.5, mt: -2 }}>
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="23" cy="23" r="22" fill="#00c6ff" fillOpacity="0.12" />
            <rect x="12" y="16" width="22" height="14" rx="7" fill="#1976d2" fillOpacity="0.82" />
            <circle cx="18.5" cy="23" r="2.5" fill="#fff" />
            <circle cx="27.5" cy="23" r="2.5" fill="#fff" />
            <rect x="20" y="27" width="6" height="2.5" rx="1.2" fill="#fff" />
          </svg>
        </Box>
        <Tabs value={tab} onChange={handleTab} centered sx={{ mb: 1 }}>
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>
        <Divider sx={{ mb: 1.5, mt: 1, width: '100%' }} />
        <form onSubmit={handleAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <TextField label="Email" type="email" fullWidth margin="normal" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required sx={{ borderRadius: 2, mt: 0, fontFamily: 'Poppins, sans-serif' }} InputLabelProps={{ sx: { fontFamily: 'Poppins, sans-serif' } }} inputProps={{ style: { fontFamily: 'Poppins, sans-serif', color: '#222' } }} />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            autoComplete={tab === 0 ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            sx={{ borderRadius: 2, mt: -1, fontFamily: 'Poppins, sans-serif' }}
            InputLabelProps={{ sx: { fontFamily: 'Poppins, sans-serif' } }}
            inputProps={{ style: { fontFamily: 'Poppins, sans-serif', color: '#222' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(v => !v)}
                    edge="end"
                    size="small"
                    sx={{ color: '#222' }}
                  >
                    {showPassword ? <VisibilityOff sx={{ color: '#222' }} /> : <Visibility sx={{ color: '#222' }} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={-2} mb={0.5}>
            <FormControlLabel
              control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} color="primary" />}
              label={<Typography sx={{ fontSize: 15, color: '#1976d2', fontFamily: 'Poppins, sans-serif' }}>Remember Me</Typography>}
              sx={{ userSelect: 'none' }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                px: 4,
                borderRadius: 3,
                boxShadow: '0 2px 12px #1976d220',
                fontWeight: 700,
                fontSize: 17,
                transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(90deg,#1976d2 0%,#00c6ff 100%)',
                  color: '#fff',
                  transform: 'scale(1.045)'
                }
              }}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? (tab === 0 ? 'Signing in...' : 'Signing up...') : (tab === 0 ? 'Sign In' : 'Sign Up')}
            </Button>
          </Box>
          {error && (
            <Typography color="error" sx={{ mb: 1, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          {info && (
            <Typography color="primary" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
              {info}
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  );
}
