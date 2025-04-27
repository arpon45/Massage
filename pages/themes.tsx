import React, { useContext } from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import PaletteIcon from '@mui/icons-material/Palette';
import { ThemeKeyContext } from './_app';

const themeOptions = [
  { key: 'light', name: 'Light', colors: ['#f5f7fb', '#ffffff', '#2196f3'] },
  { key: 'dark', name: 'Dark', colors: ['#181c23', '#23272f', '#00c6ff'] },
  { key: 'blue', name: 'Blue', colors: ['#e3f0ff', '#2196f3', '#1565c0'] },
  { key: 'green', name: 'Green', colors: ['#e9fbe5', '#43a047', '#00695c'] },
  { key: 'purple', name: 'Purple', colors: ['#f3e6fa', '#8e24aa', '#512da8'] },
];

export default function Themes() {
  const theme = useTheme();
  const { themeKey, setThemeKey } = useContext(ThemeKeyContext);
  const router = useRouter();

  const handleSelect = (key: string) => {
    setThemeKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeKey', key);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" pt={6} sx={{ bgcolor: theme.palette.background.default }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 5, minWidth: 320, maxWidth: 420, width: '100%', mb: 4, bgcolor: theme.palette.background.paper, boxShadow: 6 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <PaletteIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight={700} color="primary" sx={{ color: theme.palette.text.primary }}>Choose a Theme</Typography>
        </Box>
        <Grid container spacing={2}>
          {themeOptions.map(option => (
            <Grid item xs={6} sm={4} key={option.key}>
              <Paper
                elevation={themeKey === option.key ? 8 : 1}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: themeKey === option.key ? `2.5px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.18s, border 0.18s',
                  mb: 1,
                  bgcolor: theme.palette.background.default,
                  '&:hover': {
                    boxShadow: 8,
                    border: `2.5px solid ${theme.palette.primary.light}`,
                  },
                }}
                onClick={() => handleSelect(option.key)}
              >
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                  <Box display="flex" gap={0.5} mb={0.5}>
                    {option.colors.map((color, idx) => (
                      <Box key={color} sx={{ width: 20, height: 20, borderRadius: '50%', background: color, border: `1px solid ${theme.palette.divider}`, boxShadow: idx === 0 ? `0 1px 6px ${theme.palette.primary.main}22` : 'none' }} />
                    ))}
                  </Box>
                  <Typography fontWeight={600} color={themeKey === option.key ? 'primary' : theme.palette.text.primary} fontSize={16} sx={{ color: themeKey === option.key ? theme.palette.primary.main : theme.palette.text.primary }}>{option.name}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, py: 1.2, fontWeight: 700, fontSize: 17, borderRadius: 2, bgcolor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), '&:hover': { bgcolor: theme.palette.primary.dark } }}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </Paper>
    </Box>
  );
}
