import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import sha256 from 'crypto-js/sha256';
import { supabase } from '../src/utils/supabaseClient';

interface SetPinModalProps {
  open: boolean;
  onSet: () => void;
  userId: string;
}

export default function SetPinModal({ open, onSet, userId }: SetPinModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPin = async () => {
    setLoading(true);
    setError('');
    if (pin.length !== 4 || confirmPin.length !== 4) {
      setError('PIN must be 4 digits.');
      setLoading(false);
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      setLoading(false);
      return;
    }
    const pinHash = sha256(pin).toString();
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ pin_hash: pinHash })
      .eq('id', userId);
    if (updateErr) setError(updateErr.message);
    else {
      setPin('');
      setConfirmPin('');
      setError('');
      onSet();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" disableEscapeKeyDown>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>Set 4-digit PIN</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2, textAlign: 'center' }}>Set a 4-digit PIN to lock your app. You'll need it every time you log in.</Typography>
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
        <TextField
          fullWidth
          label="Confirm PIN"
          type={showPin ? 'text' : 'password'}
          value={confirmPin}
          onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
        <Button variant="contained" color="primary" fullWidth onClick={handleSetPin} disabled={loading || pin.length !== 4 || confirmPin.length !== 4}>
          Set PIN
        </Button>
      </DialogContent>
    </Dialog>
  );
}
