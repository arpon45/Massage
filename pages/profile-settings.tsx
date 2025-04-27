import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Avatar, Paper, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { supabase } from '../src/utils/supabaseClient';

import { useTheme } from '@mui/material/styles';

export default function ProfileSettings() {
  const theme = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated.');
        setLoading(false);
        return;
      }
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profileErr) throw profileErr;
      setUsername(profile.username || '');
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatar(profile.avatar_url ? `${profile.avatar_url}?t=${Date.now()}` : null);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated.');
      let avatarUrl = avatar;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${session.user.id}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrl ? `${publicUrl}?t=${Date.now()}` : null;
      }
      const { error: updateErr } = await supabase.from('profiles').update({
        username,
        display_name: displayName,
        bio,
        avatar_url: avatarUrl ? avatarUrl.split('?')[0] : null,
        updated_at: new Date().toISOString(),
      }).eq('id', session.user.id);
      if (updateErr) throw updateErr;
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    }
    setSaving(false);
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: theme.palette.background.default }}>
      <Paper elevation={3} sx={{
        p: { xs: 2.5, sm: 5 },
        borderRadius: 5,
        minWidth: { xs: 320, sm: 380 },
        maxWidth: 430,
        bgcolor: theme.palette.background.paper,
        boxShadow: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={2} align="center" letterSpacing={1} sx={{ fontFamily: 'Poppins, Montserrat, sans-serif', color: theme.palette.text.primary }}>
          Edit Profile
        </Typography>
        {/* Floating reload button top-right */}
        <IconButton onClick={fetchProfile} disabled={loading} sx={{
          position: 'absolute',
          top: 22,
          right: 22,
          bgcolor: theme.palette.background.paper,
          border: '2px solid #e3e8f3',
          boxShadow: 2,
          width: 38,
          height: 38,
          zIndex: 3,
          transition: '0.2s',
          '&:hover': { bgcolor: '#e3e8f3' }
        }}>
          <svg width="22" height="22" fill="none" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4v5h.582M20 20v-5h-.581"/><path d="M5.07 19A9 9 0 1 1 12 21c-2.5 0-4.78-1.03-6.5-2.7"/></svg>
        </IconButton>
        {/* Avatar with animated gradient ring and camera overlay */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, mt: 2 }}>
          <Box sx={{
            position: 'relative',
            display: 'inline-block',
            '::before': {
              content: '""',
              position: 'absolute',
              top: '-7px',
              left: '-7px',
              width: '112px',
              height: '112px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e3f0ff 0%, #cbe9ff 100%)',
              boxShadow: '0 2px 12px #1976d220',
              zIndex: 0,
            }
          }}>
            <Avatar src={avatar ?? undefined} sx={{ width: 98, height: 98, boxShadow: `0 4px 16px ${theme.palette.primary.main}22`, border: `3px solid ${theme.palette.background.paper}`, background: theme.palette.background.default, position: 'relative', zIndex: 1 }} />
            <label htmlFor="avatar-upload">
              <input
                accept="image/*"
                id="avatar-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <IconButton component="span" sx={{ position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)', bgcolor: theme.palette.background.paper, boxShadow: 1, border: `1.5px solid ${theme.palette.divider}`, width: 36, height: 36, zIndex: 2, transition: '0.2s', '&:hover': { bgcolor: theme.palette.action.hover } }}>
                <PhotoCamera sx={{ color: theme.palette.primary.main, fontSize: 22 }} />
              </IconButton>
            </label>
          </Box>
        </Box>
        <style>{`
          @keyframes popinCard {
            0% { transform: scale(0.85); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes spinRing {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={180}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
            <TextField
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              inputProps={{ minLength: 3 }}
              variant="outlined"
              sx={{
                borderRadius: 2,
                background: theme.palette.background.paper,
                boxShadow: `0 1px 4px ${theme.palette.primary.main}11`,
                mb: 1,
                input: { color: theme.palette.text.primary },
                label: { color: theme.palette.text.secondary },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: 16,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, boxShadow: `0 0 0 1.5px ${theme.palette.primary.main}33` },
                },
              }}
            />
            <TextField
              label="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              variant="outlined"
              sx={{
                borderRadius: 2,
                background: theme.palette.background.paper,
                boxShadow: `0 1px 4px ${theme.palette.primary.main}11`,
                mb: 1,
                input: { color: theme.palette.text.primary },
                label: { color: theme.palette.text.secondary },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: 16,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, boxShadow: `0 0 0 1.5px ${theme.palette.primary.main}33` },
                },
              }}
            />
            <TextField
              label="Bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              multiline
              minRows={2}
              maxRows={4}
              variant="outlined"
              sx={{
                borderRadius: 2,
                background: theme.palette.background.paper,
                boxShadow: `0 1px 4px ${theme.palette.primary.main}11`,
                mb: 1,
                textarea: { color: theme.palette.text.primary },
                label: { color: theme.palette.text.secondary },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontWeight: 400,
                  fontSize: 15,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  '& fieldset': { borderColor: theme.palette.divider },
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, boxShadow: `0 0 0 1.5px ${theme.palette.primary.main}33` },
                },
              }}
            />
            {error && <Typography color="error" fontSize={15} sx={{ mt: 1 }}>{error}</Typography>}
            {success && <Typography color="primary" fontSize={15} sx={{ mt: 1 }}>{success}</Typography>}
            <Button type="submit" variant="contained" disabled={saving} sx={{
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 0.5,
              mt: 2,
              py: 1.1,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              boxShadow: `0 2px 12px ${theme.palette.primary.main}22`,
              textTransform: 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                boxShadow: `0 3px 18px ${theme.palette.primary.main}44`,
              },
            }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}
