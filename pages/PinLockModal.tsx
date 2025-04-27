import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import sha256 from 'crypto-js/sha256';
import { supabase } from '../src/utils/supabaseClient';

interface PinLockModalProps {
  open: boolean;
  onUnlock: () => void;
  userId: string;
}

export default function PinLockModal({ open, onUnlock, userId }: PinLockModalProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // On mount, if pinVerified is set, auto-unlock
  React.useEffect(() => {
    if (localStorage.getItem('pinVerified') === 'true') {
      onUnlock();
    }
  }, [onUnlock]);

  const handleUnlock = async () => {
    setLoading(true);
    setError('');
    // Fetch pin_hash from Supabase
    const { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('pin_hash')
      .eq('id', userId)
      .single();
    if (fetchErr || !data || !data.pin_hash) {
      setError('PIN not set. Please set up your PIN in Settings.');
      setLoading(false);
      return;
    }
    const enteredHash = sha256(pin).toString();
    if (enteredHash === data.pin_hash) {
      setPin('');
      setError('');
      localStorage.setItem('pinVerified', 'true');
      onUnlock();
    } else {
      setError('Incorrect PIN.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" disableEscapeKeyDown>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>Enter PIN</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2, textAlign: 'center' }}>Enter your 4-digit PIN to unlock the app.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          fullWidth
          label="PIN"
          type={showPin ? 'text' : 'password'}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          inputProps={{ maxLength: 4, style: { letterSpacing: 8, fontSize: 28, textAlign: 'center' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPin(v => !v)} edge="end">
                  {showPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleUnlock} disabled={loading || pin.length !== 4}>
          Unlock
        </Button>
      </DialogContent>
    </Dialog>
  );
}
