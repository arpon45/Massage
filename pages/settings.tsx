import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, InputAdornment, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../src/utils/supabaseClient';
import sha256 from 'crypto-js/sha256';

const blockedUsersMock = [
  { id: '1', name: 'Blocked User 1', email: 'blocked1@email.com' },
  { id: '2', name: 'Blocked User 2', email: 'blocked2@email.com' },
];

export default function SettingsPage() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError('Failed to fetch user info.');
        setLoading(false);
        return;
      }
      setEmail(user.email || '');
      // Fetch pin_hash from profiles
      const { data: profile, error: pinErr } = await supabase
        .from('profiles')
        .select('pin_hash')
        .eq('id', user.id)
        .single();
      setPinHash(profile?.pin_hash || null);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleUpdateEmail = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    const { error } = await supabase.auth.updateUser({ email });
    if (error) setError(error.message);
    else setSuccess('Email updated! Please check your inbox for a confirmation email.');
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setSuccess('Password updated!');
    setPassword('');
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, py: 4 }}>
      <Paper sx={{ maxWidth: 420, mx: 'auto', p: 4, borderRadius: 4, boxShadow: 6 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>Settings</Typography>
        <Divider sx={{ mb: 3 }} />
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Update Email</Typography>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <Button variant="contained" color="primary" sx={{ mb: 3 }} onClick={handleUpdateEmail} disabled={loading || !email}>
          Update Email
        </Button>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Change Password</Typography>
        <TextField
          fullWidth
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button variant="contained" color="secondary" sx={{ mb: 3 }} onClick={handleUpdatePassword} disabled={loading || !password}>
          Change Password
        </Button>
        <Divider sx={{ my: 3 }} />
        {/* PIN Change Section */}
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Change PIN Lock</Typography>
        <Box sx={{ mb: 3 }}>
          {pinHash && (
            <TextField
              fullWidth
              label="Current PIN"
              type={showCurrentPin ? 'text' : 'password'}
              value={currentPin}
              onChange={e => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputProps={{ maxLength: 4, style: { letterSpacing: 8, fontSize: 24, textAlign: 'center' } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPin(v => !v)} edge="end">
                      {showCurrentPin ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
              disabled={pinLoading}
            />
          )}
          <TextField
            fullWidth
            label="New PIN"
            type={showNewPin ? 'text' : 'password'}
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputProps={{ maxLength: 4, style: { letterSpacing: 8, fontSize: 24, textAlign: 'center' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPin(v => !v)} edge="end">
                    {showNewPin ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
            disabled={pinLoading}
          />
          <TextField
            fullWidth
            label="Confirm New PIN"
            type={showNewPin ? 'text' : 'password'}
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputProps={{ maxLength: 4, style: { letterSpacing: 8, fontSize: 24, textAlign: 'center' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPin(v => !v)} edge="end">
                    {showNewPin ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
            disabled={pinLoading}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 1 }}
            disabled={Boolean(pinLoading || newPin.length !== 4 || confirmPin.length !== 4 || (pinHash ? currentPin.length !== 4 : false))}
            onClick={async () => {
              setPinLoading(true);
              setSuccess('');
              setError('');
              if (newPin !== confirmPin) {
                setError('New PINs do not match.');
                setPinLoading(false);
                return;
              }
              if (newPin === currentPin) {
                setError('New PIN must be different from current PIN.');
                setPinLoading(false);
                return;
              }
              let userId = null;
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                setError('Not authenticated.');
                setPinLoading(false);
                return;
              }
              userId = user.id;
              if (pinHash) {
                // Verify current PIN
                if (sha256(currentPin).toString() !== pinHash) {
                  setError('Current PIN is incorrect.');
                  setPinLoading(false);
                  return;
                }
              }
              // Update PIN
              const newPinHash = sha256(newPin).toString();
              const { error: updateErr } = await supabase
                .from('profiles')
                .update({ pin_hash: newPinHash })
                .eq('id', userId);
              if (updateErr) {
                setError(updateErr.message);
              } else {
                setSuccess('PIN updated successfully!');
                setCurrentPin('');
                setNewPin('');
                setConfirmPin('');
                setPinHash(newPinHash);
              }
              setPinLoading(false);
            }}
          >
            {pinHash ? 'Change PIN' : 'Set PIN'}
          </Button>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Blocked Users</Typography>
        <List>
          {blockedUsersMock.length === 0 ? (
            <Typography color="text.secondary">No blocked users.</Typography>
          ) : (
            blockedUsersMock.map(user => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Avatar>{user.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={user.email} />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}

