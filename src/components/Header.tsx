import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="static" color="primary" elevation={4} sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #00c6ff 100%)' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="Chatify Logo" style={{ height: 40, marginRight: 16 }} />
          <Typography variant="h5" fontWeight={700} letterSpacing={2} color="#fff">
            Chatify
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
