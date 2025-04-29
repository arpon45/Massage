import React from 'react';
import { Box, Typography, AppBar, Toolbar, IconButton, InputBase, BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NewChatModal from './NewChatModal';
import { supabase } from '../../src/utils/supabaseClient';
import Snackbar from '@mui/material/Snackbar';
import ChatList from './ChatList';
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

export default function ChatDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const pathToNav: Record<string, number> = { '/chat': 0, '/group': 1, '/call': 2 };
  const [nav, setNav] = React.useState(pathToNav[router.pathname] !== undefined ? pathToNav[router.pathname] : 0);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  React.useEffect(() => {
    const navToPath = ['/chat', '/group', '/call'];
    if (router.pathname !== navToPath[nav]) {
      router.push(navToPath[nav]);
    }
  }, [nav, router]);

  // Real chat data
  const [selectedChat, setSelectedChat] = React.useState<string | undefined>(undefined);
  const [chats, setChats] = React.useState<any[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!currentUserId) return;
    // Fetch all chats where current user is a member, and join the other user's profile
    const fetchChats = () => {
      supabase
        .from('chat_members')
        .select(`chat_id, status, user_id, chats(id, is_group, chat_members(user_id, status, profiles(username, display_name, avatar_url)), messages(id, content, created_at, sender_id))`)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (data) {
            const mapped = data.map((cm: any) => {
              // Find the other user for 1:1 chat
              const members = cm.chats?.chat_members?.filter((m: any) => m.user_id !== currentUserId);
              const other = members && members.length > 0 ? members[0].profiles : null;
              const lastMessage = cm.chats?.messages?.length ? cm.chats.messages[cm.chats.messages.length - 1].content : '';
              return {
                id: cm.chat_id,
                name: other ? other.display_name : 'Unknown',
                avatarUrl: other ? other.avatar_url : '',
                lastMessage,
                status: cm.status,
                isRequestReceiver: cm.status === 'pending',
                isOtherProfileMissing: !other,
              };
            }).filter((chat: any) => !chat.isOtherProfileMissing);
            setChats(mapped);
          }
        });
    };
    fetchChats();
    // Subscribe to new messages for live update
    const messageSub = supabase
      .channel('messages-listen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        fetchChats();
      })
      .subscribe();
    // Subscribe to chat_members for new chat requests (incoming/outgoing)
    const chatMembersSub = supabase
      .channel('chat-members-listen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_members' }, payload => {
        fetchChats();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(messageSub);
      supabase.removeChannel(chatMembersSub);
    };
  }, [currentUserId, snackOpen, refreshKey]);

  // Accept/reject handlers
  const handleAcceptRequest = async (chatId: string) => {
    await supabase.from('chat_members').update({ status: 'accepted' }).eq('chat_id', chatId).eq('user_id', currentUserId);
    setSnackOpen(true);
  };
  const handleRejectRequest = async (chatId: string) => {
    await supabase.from('chat_members').update({ status: 'rejected' }).eq('chat_id', chatId).eq('user_id', currentUserId);
    setSnackOpen(true);
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', width: '100vw', pb: isMobile ? 7 : 0, position: 'relative', overflow: 'hidden' }}>
      <Particles
        id="tsparticles"
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
      {/* Header */}
      <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, type: 'spring', bounce: 0.45 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 'none', background: 'linear-gradient(90deg,#1976d2 0%,#00c6ff 100%)', boxShadow: '0 2px 24px #1976d220', borderRadius: '0 0 32px 32px', zIndex: 2 }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: 1, minHeight: 64 }}>
            {/* Left: Chatify header */}
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1.05 }} transition={{ duration: 1.2, yoyo: Infinity }}>
              <Typography fontWeight={900} sx={{ fontSize: 28, color: '#fff', letterSpacing: 2, mr: 2, ml: 1, textShadow: '0 2px 8px #1976d255,0 0 16px #00c6ff66' }}>
                Chatify
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
      </motion.div>
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
                      localStorage.removeItem('pinVerified'); // Clear PIN flag on logout
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
      {/* Search Bar */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', bgcolor: theme.palette.background.paper, borderRadius: 2, p: 1, boxShadow: 'none', width: '100%' }}>
          <SearchIcon color="action" />
          <InputBase placeholder="Search" sx={{ ml: 1, flex: 1, fontSize: 17, color: theme.palette.text.primary }} inputProps={{ 'aria-label': 'search', style: { color: theme.palette.text.primary } }} />
        </Paper>
      </Box>
      {/* Chat List */}
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
          <ChatList chats={chats} onSelect={setSelectedChat} selectedId={selectedChat} onAcceptRequest={handleAcceptRequest} onRejectRequest={handleRejectRequest} />

        </Paper>
      </Box>

      {/* New Chat Floating Button */}
      {currentUserId && (
        <Fab
          color="primary"
          aria-label="new-chat"
          sx={{ position: 'fixed', bottom: 80, right: 32, zIndex: 1200 }}
          onClick={() => setNewChatOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}
      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onRequestSent={() => { setSnackOpen(true); setRefreshKey(k => k + 1); }}
        currentUserId={currentUserId || ''}
      />
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message="Chat request sent!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      {/* Bottom Navigation */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, bgcolor: theme.palette.background.paper }} elevation={3}>
        <BottomNavigation
          value={nav}
          onChange={(_, newValue) => setNav(newValue)}
          showLabels
          sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}
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
  );
}
