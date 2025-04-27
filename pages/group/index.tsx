import React, { useState } from 'react';
import GroupList from './GroupList';
import { Box, Typography, AppBar, Toolbar, IconButton, InputBase, BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme, Button, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ChatIcon from '@mui/icons-material/Chat';
import CallIcon from '@mui/icons-material/Call';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';

export default function GroupDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const pathToNav: Record<string, number> = { '/chat': 0, '/group': 1, '/call': 2 };
  const [nav, setNav] = React.useState(pathToNav[router.pathname] !== undefined ? pathToNav[router.pathname] : 1);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  const groups = [
    { id: '1', name: 'Developers', avatarUrl: '', lastActivity: 'Today', members: 8 },
    { id: '2', name: 'Family', avatarUrl: '', lastActivity: 'Yesterday', members: 5 },
    { id: '3', name: 'Friends', avatarUrl: '', lastActivity: 'Yesterday', members: 12 },
    { id: '4', name: 'Work', avatarUrl: '', lastActivity: '2 days ago', members: 20 }
  ];

  React.useEffect(() => {
    const navToPath = ['/chat', '/group', '/call'];
    if (router.pathname !== navToPath[nav]) {
      router.push(navToPath[nav]);
    }
  }, [nav, router]);

  return (
    <>
      <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', width: '100vw', pb: isMobile ? 7 : 0, position: 'relative', overflow: 'hidden' }}>
        <Particles
        id="tsparticles-group"
        options={{
          background: { color: { value: theme.palette.background.default } },
          fpsLimit: 60,
          particles: {
            color: { value: ['#1976d2', '#43a047', '#fbc02d', '#00c6ff'] },
            links: { enable: true, color: '#1976d2', distance: 120 },
            move: { enable: true, speed: 0.8 },
            number: { value: 40 },
            opacity: { value: 0.6 },
            shape: { type: 'circle' },
            size: { value: 3 },
          },
          detectRetina: true,
        }}
        style={{ position: 'absolute', zIndex: 0 }}
      />
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.45 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <AppBar position="static" color="transparent" elevation={0} sx={{
          borderBottom: 'none',
          background: 'linear-gradient(90deg,#1976d2 0%,#00c6ff 100%)',
          boxShadow: '0 2px 24px #1976d220',
          borderRadius: '0 0 32px 32px',
          zIndex: 2 }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: 1, minHeight: 64 }}>
            {/* Left: Group header */}
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1.05 }} transition={{ duration: 1.2, yoyo: Infinity }}>
              <Typography fontWeight={900} sx={{ fontSize: 28, color: '#fff', letterSpacing: 2, mr: 2, ml: 1, textShadow: '0 2px 8px #1976d255,0 0 16px #00c6ff66' }}>
                Groups
              </Typography>
            </motion.div>
            {/* Right: Menu Icon */}
            <motion.div whileHover={{ rotate: 90, scale: 1.15 }} transition={{ type: 'spring', stiffness: 300 }}>
              <IconButton edge="end" sx={{ mr: 1, color: '#fff', bgcolor: '#1976d2', boxShadow: '0 2px 8px #1976d244', transition: 'all 0.2s cubic-bezier(.4,2,.6,1)' }} onClick={() => setDrawerOpen(true)}>
                <MenuIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </motion.div>
          </Toolbar>
        </AppBar>
      </motion.header>
      {/* Search Bar */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', bgcolor: theme.palette.background.paper, borderRadius: 2, p: 1, boxShadow: 'none', width: '100%' }}>
          <SearchIcon color="action" />
          <InputBase placeholder="Search" sx={{ ml: 1, flex: 1, fontSize: 17, color: theme.palette.text.primary }} inputProps={{ 'aria-label': 'search', style: { color: theme.palette.text.primary } }} />
        </Paper>
      </Box>
      {/* Group List */}
      <Box sx={{
        px: { xs: 0.5, sm: 2, md: 0 },
        pt: { xs: 0.5, sm: 1 },
        pb: { xs: 8, sm: 10 },
        maxWidth: 520,
        mx: 'auto',
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Paper elevation={0} sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: { xs: 2.5, sm: 4 },
          p: 0,
          boxShadow: '0 2px 12px ' + theme.palette.primary.main + '08',
          width: '100%',
          maxWidth: 520,
          mt: { xs: 2, sm: 4 },
        }}>
          {groups.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, py: 4 }}>
              <Typography component="div" sx={{ fontWeight: 600, color: '#757575', fontSize: 22, mb: 0.5 }}>No groups found</Typography>
              <Typography component="div" sx={{ color: '#9e9e9e', fontSize: 15 }}>Your contacts and groups will appear here.</Typography>
            </Box>
          ) : (
            <GroupList groups={groups} onSelect={setSelectedGroup} selectedId={selectedGroup} />
          )}
        </Paper>
      </Box>
      {/* Drawer for menu */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            style={{ position: 'fixed', top: 0, right: 0, zIndex: 2000, height: '100vh' }}
          >
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
              PaperProps={{ sx: { width: 280, borderRadius: '16px 0 0 16px', bgcolor: theme.palette.background.paper, boxShadow: 12, p: 0 } }}
              transitionDuration={350}
            >
              <Box sx={{ p: 3, pt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" fontWeight={800} color="primary" sx={{ mb: 2, textAlign: 'center', letterSpacing: 1, fontSize: 25, textShadow: '0 2px 8px', color: theme.palette.text.primary }}>Menu</Typography>
                <List>
                  <motion.div whileHover={{ scale: 1.08, x: 8 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <ListItem button onClick={() => { setDrawerOpen(false); router.push('/themes'); }} sx={{ borderRadius: 2, mb: 2, transition: 'background 0.2s', color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      <ListItemIcon sx={{ color: theme.palette.primary.main }}><PaletteIcon /></ListItemIcon>
                      <ListItemText primary="Themes" primaryTypographyProps={{ fontWeight: 600, color: theme.palette.text.primary }} />
                    </ListItem>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.08, x: 8 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <ListItem button onClick={() => { setDrawerOpen(false); router.push('/settings'); }} sx={{ borderRadius: 2, mb: 2, transition: 'background 0.2s', color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      <ListItemIcon sx={{ color: theme.palette.warning.main }}><SettingsIcon /></ListItemIcon>
                      <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 600, color: theme.palette.text.primary }} />
                    </ListItem>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.08, x: 8 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <ListItem button onClick={() => { setDrawerOpen(false); router.push('/profile-settings'); }} sx={{ borderRadius: 2, mb: 2, transition: 'background 0.2s', color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      <ListItemIcon sx={{ color: theme.palette.info.main }}><PersonIcon /></ListItemIcon>
                      <ListItemText primary="Profile Settings" primaryTypographyProps={{ fontWeight: 600, color: theme.palette.text.primary }} />
                    </ListItem>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.08, x: 8 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <ListItem button onClick={async () => {
                      setDrawerOpen(false);
                      await import('../../src/utils/supabaseClient').then(async mod => {
                        await mod.supabase.auth.signOut();
                        router.replace('/');
                      });
                    }} sx={{ borderRadius: 2, mb: 0, transition: 'background 0.2s', color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      <ListItemIcon sx={{ color: theme.palette.error.main }}><LogoutIcon /></ListItemIcon>
                      <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 600, color: theme.palette.text.primary }} />
                    </ListItem>
                  </motion.div>
                </List>
              </Box>
            </Drawer>
          </motion.div>
        )}
      </AnimatePresence>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, bgcolor: theme.palette.background.paper }} elevation={3}>
        <BottomNavigation
          value={nav}
          onChange={(_, newValue) => setNav(newValue)}
          showLabels
          sx={{ bgcolor: 'transparent', boxShadow: 'none', height: 64 }}
        >
          <BottomNavigationAction 
            label="Chats" 
            icon={<ChatIcon sx={{ fontSize: nav === 0 ? 32 : 24, color: nav === 0 ? '#1976d2' : '#757575', transition: 'all 0.2s cubic-bezier(.4,2,.6,1)' }} />} 
            sx={{ mx: 2, '&.Mui-selected': {
              color: '#1976d2',
              transform: 'scale(1.15)',
              transition: 'all 0.2s cubic-bezier(.4,2,.6,1)'
            }
          }}
          />
          <BottomNavigationAction 
            label="Groups" 
            icon={<PeopleIcon sx={{ fontSize: nav === 1 ? 32 : 24, color: nav === 1 ? '#43a047' : '#757575', transition: 'all 0.2s cubic-bezier(.4,2,.6,1)' }} />} 
            sx={{ mx: 2, '&.Mui-selected': {
              color: '#43a047',
              transform: 'scale(1.15)',
              transition: 'all 0.2s cubic-bezier(.4,2,.6,1)'
            }
          }}
          />
          <BottomNavigationAction 
            label="Call History" 
            icon={<CallIcon sx={{ fontSize: nav === 2 ? 32 : 24, color: nav === 2 ? '#fbc02d' : '#757575', transition: 'all 0.2s cubic-bezier(.4,2,.6,1)' }} />} 
            sx={{ mx: 2, '&.Mui-selected': {
              color: '#fbc02d',
              transform: 'scale(1.15)',
              transition: 'all 0.2s cubic-bezier(.4,2,.6,1)'
            }
          }}
          />
        </BottomNavigation>
      </Paper>
    </Box>
      </>
  );
}
