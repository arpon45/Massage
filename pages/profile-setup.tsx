import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Avatar, Paper, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { supabase } from '../src/utils/supabaseClient';
import { useTheme } from '@mui/material/styles';

export default function ProfileSetup() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    if (!/^\w+$/.test(username)) {
      setUsernameAvailable(null);
      setUsernameError('Only letters, numbers, and underscores allowed.');
      return;
    }
    setUsernameError('');
    setCheckingUsername(true);
    const timeout = setTimeout(async () => {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      setUsernameAvailable(!existing);
      setCheckingUsername(false);
      if (existing) setUsernameError('Username already taken.');
      else setUsernameError('');
    }, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated.');
        setLoading(false);
        return;
      }
      const userId = session.user.id;
      // 2. Check username uniqueness
      const { data: existing, error: usernameErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      if (existing) {
        setError('Username already taken.');
        setLoading(false);
        return;
      }
      // 3. Upload avatar if provided
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${userId}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadErr) {
          setError('Failed to upload avatar: ' + uploadErr.message);
          setLoading(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrl;
      }
      // 4. Insert profile row
      const { error: insertErr } = await supabase.from('profiles').upsert({
        id: userId,
        username,
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      if (insertErr) {
        setError('Failed to save profile: ' + insertErr.message);
        setLoading(false);
        return;
      }
      // 5. Redirect to chat
      window.location.href = '/chat';
    } catch (err: any) {
      setError('Unexpected error: ' + err.message);
    }
    setLoading(false);
  };


  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="transparent">
      <Paper elevation={8} sx={{
        p: { xs: 2, sm: 4 },
        minWidth: { xs: 310, sm: 370 },
        maxWidth: 410,
        borderRadius: 6,
        boxShadow: '0 8px 32px #1976d240, 0 1.5px 6px #00c6ff33',
        background: isDark ? 'rgba(24,28,35,0.96)' : 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: isDark ? '1.5px solid #23272f' : '1.5px solid #e3e8f3',
        mt: -6
      }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2, letterSpacing: 1, textAlign: 'center', color: isDark ? '#fff' : '#1976d2' }}>
          Complete Your Profile
        </Typography>
        <Box sx={{ mb: 4, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar src={avatar ?? undefined} sx={{ width: 82, height: 82, boxShadow: '0 4px 16px #00c6ff44' }} />
          <label htmlFor="avatar-upload">
            <input
              accept="image/*"
              id="avatar-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <IconButton component="span" sx={{
              bgcolor: '#fff',
              boxShadow: 2,
              position: 'absolute',
              top: 56,
              left: '50%',
              transform: 'translate(-50%, 0)',
              border: '2px solid #e3e8f3',
              width: 38,
              height: 38,
              zIndex: 2,
              '&:hover': { bgcolor: '#e3e8f3' }
            }}>
              <PhotoCamera color="primary" />
            </IconButton>
          </label>
        </Box>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TextField 
            label="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            fullWidth 
            required
            sx={{ mb: 1, 
                  '& .MuiInputBase-input': { color: isDark ? '#fff' : '#181c23' },
                  '& .MuiInputLabel-root': { color: isDark ? '#aaa' : '#1976d2' },
                  '& .MuiFormHelperText-root': { color: isDark ? '#aaa' : '#1976d2' },
             }}
             helperText={usernameError ? usernameError : (usernameAvailable === true ? 'Username is available!' : 'Unique, used for search and messaging')}
             error={!!usernameError}
             InputProps={{
               endAdornment: checkingUsername ? <CircularProgress size={18} /> : usernameAvailable === true ? <span style={{color:'#388e3c',fontWeight:600}}>✔</span> : usernameAvailable === false ? <span style={{color:'#d32f2f',fontWeight:600}}>✖</span> : null,
               style: { color: isDark ? '#fff' : '#181c23' }
             }}
           />
           <TextField label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} fullWidth required sx={{ mb: 2, '& .MuiInputBase-input': { color: isDark ? '#fff' : '#181c23' }, '& .MuiInputLabel-root': { color: isDark ? '#aaa' : '#1976d2' } }} />
           <TextField label="Bio" value={bio} onChange={e => setBio(e.target.value)} fullWidth multiline rows={2} sx={{ mb: 2, '& .MuiInputBase-input': { color: isDark ? '#fff' : '#181c23' }, '& .MuiInputLabel-root': { color: isDark ? '#aaa' : '#1976d2' } }} />
           {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
           <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 1, fontWeight: 700, fontSize: 17, borderRadius: 3, color: isDark ? '#fff' : '#181c23', bgcolor: isDark ? '#1976d2' : '#00e1ff', '&:hover': { bgcolor: isDark ? '#1565c0' : '#00bcd4' } }}>
             {loading ? <CircularProgress size={22} color="inherit" /> : 'Finish Setup'}
           </Button>
        </form>
      </Paper>
    </Box>
  );
}
