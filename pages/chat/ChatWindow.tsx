import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Box, Typography, Avatar, TextField, IconButton, List, ListItem, ListItemAvatar, ListItemText, Paper, CircularProgress, Dialog, Button, Menu, MenuItem, Input } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { supabase } from '../../src/utils/supabaseClient';
import { useRouter } from 'next/router';
import { FileMessageBubble } from './FileMessageBubble';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  type?: string; // 'text' | 'audio' | 'file'
  audio_url?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

interface ChatWindowProps {
  chatId: string;
  currentUserId: string;
  currentUserAvatarUrl?: string;
  currentUserDisplayName?: string; // Add this prop for the current user's display name
  otherUser?: { id: string; display_name: string; avatar_url?: string; bio?: string };
  deleteChat?: () => void;
}

// Utility: get initials from display name
function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


export default function ChatWindow({ chatId, currentUserId, currentUserAvatarUrl, currentUserDisplayName, otherUser, deleteChat }: ChatWindowProps) {
  // Scroll to and highlight a message by id
  const scrollToMessage = (messageId: string) => {
    const listElem = listRef.current;
    if (!listElem) return;
    const targetElem = listElem.querySelector(`[data-message-id='${messageId}']`);
    if (targetElem) {
      (targetElem as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElem.classList.add('highlight-message');
      setTimeout(() => targetElem.classList.remove('highlight-message'), 1200);
    }
  };

  // Add highlight-message style to the document (only once)
  if (typeof window !== 'undefined' && !document.getElementById('highlight-message-style')) {
    const style = document.createElement('style');
    style.id = 'highlight-message-style';
    style.innerHTML = `.highlight-message { background: #00bcd44d !important; transition: background 0.4s; }`;
    document.head.appendChild(style);
  }

  // Block opponent handler
  const handleBlockOpponent = async () => {
    if (!otherUser?.id || !currentUserId) return;
    try {
      await supabase
        .from('chat_members')
        .update({ status: 'blocked' })
        .eq('chat_id', chatId)
        .eq('user_id', otherUser.id);
      setMenuAnchorEl(null);
      // Optionally, show a notification or update UI
    } catch (err) {
      // Optionally, show error
    }
  };

  // Delete chat handler
  const handleDeleteChat = async () => {
    setMenuAnchorEl(null);
    if (deleteChat) deleteChat();
  };

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Filter messages for search
  const filteredMessages = searchQuery.trim()
    ? messages.filter(msg => msg.content.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const router = useRouter();

  // Voice message state
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0); // seconds
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null); // URL of recorded blob
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Optionally limit file size/type here
    const fileExt = file.name.split('.').pop();
    const fileName = `file_${Date.now()}_${currentUserId}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file, { contentType: file.type });
    if (!error) {
      const { publicUrl } = supabase.storage.from('chat-files').getPublicUrl(fileName).data;
      await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: currentUserId,
        content: '',
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        type: 'file'
      });
    } else {
      alert('File upload failed! ' + (error?.message || ''));
    }
    // Reset the file input value so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices) return alert("Audio recording not supported!");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    audioChunksRef.current = [];
    setRecordingTime(0);
    recorder.start();
    setRecording(true);
    // Start timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setRecordingInterval(interval);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      setRecording(false);
      if (recordingInterval) clearInterval(recordingInterval);
      setRecordingInterval(null);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setAudioPreview(url);
    };
  };

  const handlePauseRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
    }
  };

  const handleCancelAudio = () => {
    setAudioPreview(null);
    audioChunksRef.current = [];
    setRecordingTime(0);
  };

  const handleSendAudio = async () => {
    setIsUploadingAudio(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const fileName = `voice_${Date.now()}_${currentUserId}.webm`;
    const { data, error } = await supabase.storage
      .from('voice-messages')
      .upload(fileName, audioBlob, { contentType: 'audio/webm' });
    if (!error) {
      const { publicUrl } = supabase.storage.from('voice-messages').getPublicUrl(fileName).data;
      await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: currentUserId,
        content: '',
        audio_url: publicUrl,
        type: 'audio'
      });
      setAudioPreview(null);
      audioChunksRef.current = [];
      setRecordingTime(0);
    } else {
      console.error('Supabase upload error:', error);
      alert("Audio upload failed! " + (error?.message || ''));
    }
    setIsUploadingAudio(false);
  };

  useEffect(() => {
    setLoading(true);
    // Focus the input when the chat window mounts
    setTimeout(() => inputRef.current?.focus(), 10);
    supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
    // Subscribe to new messages
    const sub = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, payload => {
        setMessages(msgs => [...msgs, payload.new as Message]);
      })
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [chatId]);

  // Reliable smooth scroll to bottom
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current?.scrollHeight || 0, behavior: 'smooth' });
    });
  };

  // Always scroll to bottom on first load or when messages change
  useLayoutEffect(() => {
    if (!loading && messages.length > 0) {
      listRef.current?.scrollTo({ top: listRef.current?.scrollHeight || 0, behavior: 'auto' });
    }
  }, [loading, messages.length]);

  // Smooth scroll for new messages after initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
    // eslint-disable-next-line
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    await supabase.from('messages').insert({ chat_id: chatId, sender_id: currentUserId, content: newMessage });
    setNewMessage('');
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  // Refocus input when messages update (new message arrives)
  useEffect(() => {
    inputRef.current?.focus();
  }, [messages]);


  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, Arial, sans-serif',
      zIndex: 1200,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Paper elevation={8} sx={{
        height: 64,
        minHeight: 64,
        maxHeight: 64,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '0 0 20px 20px',
        bgcolor: 'rgba(35,38,43,0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 6px 24px 0 #0002',
        flexShrink: 0,
        borderBottom: '1.5px solid #1e1e1e',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Avatar preview modal trigger */}
          <Avatar
            src={otherUser?.avatar_url}
            sx={{ mr: 1.5, width: 46, height: 46, borderRadius: '50%', boxShadow: '0 2px 8px #0004', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #0007' } }}
            onClick={() => setAvatarPreviewOpen(true)}
            title="Preview avatar"
          />
          {/* Name as clickable button for profile */}
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', px: 1, py: 0.5, borderRadius: 2 }}
          >
            <Typography fontWeight={700} sx={{ fontSize: 18, color: '#fff', letterSpacing: 0.2, fontFamily: 'system-ui, Arial, sans-serif', textShadow: '0 2px 8px #0005' }}>{otherUser?.display_name || 'Chat'}</Typography>
            {otherUser?.bio && (
              <Typography sx={{ fontSize: 13, color: '#b0b3ba', mt: 0.2, fontFamily: 'system-ui, Arial, sans-serif', fontStyle: 'italic', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{otherUser.bio}</Typography>
            )}
          </Box>
        </Box>
        
        <IconButton
          color="inherit"
          size="large"
          onClick={e => { setMenuAnchorEl(e.currentTarget); }}
          sx={{ ml: 1, color: '#fff', transition: 'all 0.18s', '&:hover': { bgcolor: '#23262b' } }}
        >
          <MoreVertIcon sx={{ fontSize: 28 }} />
        </IconButton>
        {/* Floating Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
          PaperProps={{ sx: { bgcolor: '#181b1c', color: '#fff', borderRadius: 2, boxShadow: '0 8px 32px #000a', mt: 1, minWidth: 220, py: 1 } }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={async () => { setMenuAnchorEl(null); if (typeof handleBlockOpponent === 'function') await handleBlockOpponent(); }} sx={{ fontWeight: 700, fontSize: 18, color: '#fff', py: 2, px: 3, '&:hover': { bgcolor: '#23262b' } }}>
            Block
          </MenuItem>
          <MenuItem onClick={async () => { setMenuAnchorEl(null); if (typeof handleDeleteChat === 'function') await handleDeleteChat(); }} sx={{ fontWeight: 700, fontSize: 18, color: '#fff', py: 2, px: 3, '&:hover': { bgcolor: '#23262b' } }}>
            Delete chat
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchorEl(null); setSearchDialogOpen(true); }} sx={{ fontWeight: 700, fontSize: 18, color: '#fff', py: 2, px: 3, '&:hover': { bgcolor: '#23262b' } }}>
            Search
          </MenuItem>
        </Menu>
        {/* Search Dialog */}
        <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="sm" fullWidth>
          <Box sx={{ bgcolor: '#23262b', p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
              Search Messages
            </Typography>
            <TextField
              autoFocus
              fullWidth
              placeholder="Type to search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ input: { color: '#fff', bgcolor: '#23262b', borderRadius: 1 }, mb: 2 }}
              InputProps={{ style: { color: '#fff', background: '#23262b' } }}
            />
            <List sx={{ maxHeight: 300, overflowY: 'auto', bgcolor: 'transparent' }}>
              {filteredMessages.length === 0 && (
                <ListItem>
                  <ListItemText primary={<span style={{ color: '#aaa' }}>No results found.</span>} />
                </ListItem>
              )}
              {filteredMessages.map((msg: Message) => (
                <ListItem
                  key={msg.id}
                  alignItems="flex-start"
                  button
                  onClick={() => {
                    setSearchDialogOpen(false);
                    setTimeout(() => scrollToMessage(msg.id), 250);
                  }}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#1a232b' } }}
                >
                  <ListItemText
                    primary={<span style={{ color: '#fff' }}>{msg.content}</span>}
                    secondary={<span style={{ color: '#888' }}>{new Date(msg.created_at).toLocaleString()}</span>}
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="outlined" color="inherit" sx={{ mt: 2 }} onClick={() => setSearchDialogOpen(false)}>Close</Button>
          </Box>
        </Dialog>
        {/* Avatar Preview Modal */}
        <Dialog open={avatarPreviewOpen} onClose={() => setAvatarPreviewOpen(false)} maxWidth="xs" PaperProps={{ sx: { bgcolor: '#23262b', borderRadius: 3, p: 2 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, pt: 3 }}>
            <Avatar
              src={otherUser?.avatar_url}
              sx={{
                width: 160, height: 160, borderRadius: '50%', boxShadow: '0 6px 32px #000a', border: '4px solid #fff', objectFit: 'cover', mb: 2
              }}
              imgProps={{ style: { objectFit: 'cover', width: '100%', height: '100%' } }}
            />
            <Typography sx={{ color: '#fff', fontWeight: 600, mt: 2, fontSize: 22 }}>{otherUser?.display_name}</Typography>
            {otherUser?.bio && (
              <Typography sx={{ color: '#b0b3ba', mt: 1, fontSize: 16, fontStyle: 'italic', textAlign: 'center', maxWidth: 320 }}>{otherUser.bio}</Typography>
            )}
            <Button variant="outlined" color="inherit" sx={{ mt: 3 }} onClick={() => setAvatarPreviewOpen(false)}>
              Close
            </Button>
          </Box>
        </Dialog>
      </Paper>
      {/* Messages */}
      <Box
        ref={listRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 2, sm: 5 },
          py: 2.5,
          pb: 10,
          width: '100%',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
          position: 'relative',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {loading ? <CircularProgress sx={{ mt: 4, mx: 'auto', display: 'block' }} /> : (
          <List sx={{ width: '100%', pb: 0 }}>
            {messages.map((msg, idx) => {
              const isMine = msg.sender_id === currentUserId;
              const prevMsg = messages[idx - 1];
              // Show avatar if first message or sender changed
              const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
              // Use destructured prop or props.currentUserAvatarUrl
              const avatarUrl = isMine ? (typeof currentUserAvatarUrl !== 'undefined' ? currentUserAvatarUrl : undefined) : otherUser?.avatar_url;
              return (
                <ListItem key={msg.id} data-message-id={msg.id} sx={{
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  border: 'none',
                  bgcolor: 'transparent',
                  py: 1.2,
                  transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                }} disableGutters>
                  {/* Avatar bubble (only if sender changed) */}
                  {showAvatar && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      mr: isMine ? 0 : 1.2,
                      ml: isMine ? 1.2 : 0,
                      order: isMine ? 2 : 0,
                    }}>
                      <Avatar src={avatarUrl && avatarUrl !== '' ? avatarUrl : undefined} sx={{ width: 28, height: 28, boxShadow: '0 2px 8px #0006', bgcolor: '#19191e' }}>
                        {/* Fallback: show initials or icon if no avatar */}
                        {(!avatarUrl || avatarUrl === '') && (
                          isMine
                            ? (getInitials(currentUserDisplayName) || <PersonIcon fontSize="small" sx={{ color: '#fff' }} />)
                            : (getInitials(otherUser?.display_name) || <PersonIcon fontSize="small" sx={{ color: '#fff' }} />)
                        )}
                      </Avatar>
                    </Box>
                  )}
                  <Paper sx={{
                    p: '14px 22px',
                    bgcolor: isMine ? '#101014' : '#23232b',
                    color: '#fff',
                    borderRadius: isMine ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                    maxWidth: 420,
                    fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif',
                    boxShadow: '0 4px 24px #0008',
                    fontSize: 17,
                    transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                    animation: 'fadeIn 0.5s',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
                      to: { opacity: 1, transform: 'none' },
                    },
                  }}>
                    {msg.type === 'file' && msg.file_url ? (
                      <FileMessageBubble
                        fileUrl={msg.file_url}
                        fileName={msg.file_name || ''}
                        fileType={msg.file_type || ''}
                        fileSize={msg.file_size || 0}
                        isMine={isMine}
                      />
                    ) : (msg.type === 'audio' || (!msg.type && msg.audio_url)) && msg.audio_url ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <audio controls src={msg.audio_url} style={{ width: 180, marginRight: 8 }} />
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 17, fontWeight: 500, wordBreak: 'break-word', color: '#fff', fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif', lineHeight: 1.5 }}>
                        {msg.content}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: 12, color: '#b0b3ba', mt: 0.8, textAlign: 'right', fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif', lineHeight: 1.2, fontStyle: 'italic', opacity: 0.75 }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                </ListItem>
              );
            })}
          </List>
        )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2, py: 1, bgcolor: '#19191e', borderRadius: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending || recording}
            sx={{ bgcolor: '#19191e', borderRadius: 2, flex: 1, mr: 1 }}
            InputProps={{
              endAdornment: (
                <IconButton component="label" sx={{ mr: 1 }}>
                  <AttachFileIcon />
                  <input type="file" hidden onChange={handleFileChange} />
                </IconButton>
              ),
            }}
          />
          <IconButton onClick={recording ? handlePauseRecording : handleStartRecording} sx={{ ml: 1 }} color={recording ? 'error' : 'default'}>
            {recording ? <StopIcon /> : <MicIcon />}
          </IconButton>
          <IconButton color="primary" onClick={handleSend} disabled={sending || !newMessage.trim() || recording} sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#1565c0' }, width: 38, height: 38, ml: 0.5 }}>
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        
      </Box>
  )}