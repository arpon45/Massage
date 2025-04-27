import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, CircularProgress, InputAdornment, IconButton, Box, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { supabase } from '../../src/utils/supabaseClient';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onRequestSent: (user: UserProfile) => void;
  currentUserId: string;
}

export default function NewChatModal({ open, onClose, onRequestSent, currentUserId }: NewChatModalProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!search) {
      setResults([]);
      return;
    }
    setLoading(true);
    const fetch = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
        .neq('id', currentUserId)
        .limit(10);
      setResults(data || []);
      setLoading(false);
    }, 400);
    return () => clearTimeout(fetch);
  }, [search, currentUserId]);

  const handleSendRequest = async (user: UserProfile) => {
    setSendingId(user.id);
    // Check if a chat already exists between these two users
    const { data: existing, error: existingErr } = await supabase
      .from('chat_members')
      .select('chat_id')
      .or(`user_id.eq.${currentUserId},user_id.eq.${user.id}`)
      .in('chat_id',
        (
          await supabase
            .from('chat_members')
            .select('chat_id')
            .eq('user_id', currentUserId)
        ).data?.map((cm: any) => cm.chat_id) || []
      );
    if (existing && existing.length >= 2) {
      alert('A chat with this user already exists or is pending.');
      setSendingId(null);
      return;
    }
    // 1. Create chat
    const { data: chat, error: chatErr } = await supabase
      .from('chats')
      .insert([{ is_group: false }])
      .select()
      .single();
    if (chatErr || !chat) {
      setSendingId(null);
      return;
    }
    // 2. Add both users to chat_members (sender: accepted, receiver: pending)
    await supabase.from('chat_members').insert([
      { chat_id: chat.id, user_id: currentUserId, status: 'accepted' },
      { chat_id: chat.id, user_id: user.id, status: 'pending' },
    ]);
    setSendingId(null);
    onRequestSent(user);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 0 } }}>
      <DialogTitle sx={{ fontSize: 28, fontWeight: 800, textAlign: 'center', pt: 4, pb: 2, letterSpacing: 1 }}>Start New Chat</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 6 }, pb: 4, pt: 1 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Search by username or name"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            sx: { fontSize: 20, py: 2 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton disabled>
                  <SearchIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 3, borderRadius: 2, boxShadow: 2, bgcolor: 'background.paper' }}
        />
        <Paper elevation={2} sx={{ maxHeight: 350, overflowY: 'auto', borderRadius: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <List>
              {results.map(user => (
                <React.Fragment key={user.id}>
                  <ListItem secondaryAction={
                    <Button
                      variant="contained"
                      size="medium"
                      sx={{ borderRadius: 2, minWidth: 120, fontWeight: 700 }}
                      disabled={sendingId === user.id}
                      onClick={() => handleSendRequest(user)}
                    >
                      {sendingId === user.id ? <CircularProgress size={18} /> : 'Send Request'}
                    </Button>
                  } sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={user.avatar_url} sx={{ width: 54, height: 54, fontSize: 26, fontWeight: 700 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<span style={{ fontWeight: 700, fontSize: 20 }}>{user.display_name}</span>}
                      secondary={<span style={{ color: '#888', fontSize: 16 }}>@{user.username}</span>}
                    />
                  </ListItem>
                  <Box sx={{ mx: 3 }}><hr style={{ border: 0, borderTop: '1px solid #eee' }} /></Box>
                </React.Fragment>
              ))}
              {!loading && results.length === 0 && search && (
                <ListItem>
                  <ListItemText primary={<span style={{ fontSize: 18, color: '#999' }}>No users found.</span>} />
                </ListItem>
              )}
            </List>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
}
