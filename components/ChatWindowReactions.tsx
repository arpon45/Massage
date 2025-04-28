import React, { useState } from 'react';
import { Box, IconButton, Popover, Typography } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { MessageReaction } from '../lib/types';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏', '🎉', '🔥', '🙏'];

interface MessageReactionsProps {
  messageId: string;
  currentUserId: string;
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId, currentUserId, reactions, onReact }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReaction = (emoji: string) => {
    onReact(emoji);
    handleClose();
  };

  // Group reactions by emoji
  const grouped = REACTIONS.map(emoji => ({
    emoji,
    users: reactions.filter(r => r.emoji === emoji)
  })).filter(g => g.users.length > 0);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
      {/* Existing reactions */}
      {grouped.map(g => {
        const isMine = g.users.some(u => u.user_id === currentUserId);
        return (
          <Box
            key={g.emoji}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: isMine ? '#00bcd4' : '#23262b',
              borderRadius: 2,
              px: 1,
              py: 0.2,
              mr: 0.5,
              fontSize: 18,
              cursor: 'pointer',
              border: isMine ? '2px solid #00bcd4' : 'none',
              color: isMine ? '#fff' : '#fff',
              boxShadow: isMine ? '0 2px 8px #00bcd488' : undefined,
              transition: 'transform 0.1s, background 0.2s',
              '&:active': { transform: 'scale(0.92)' },
              userSelect: 'none',
            }}
            onClick={() => handleReaction(g.emoji)}
            title={isMine ? 'Remove my reaction' : 'React'}
          >
            <span>{g.emoji}</span>
            <Typography sx={{ ml: 0.5, fontSize: 13, color: '#fff' }}>{g.users.length}</Typography>
          </Box>
        );
      })}
      {/* Add reaction button */}
      <IconButton size="small" onClick={handleOpen} sx={{ ml: 0.5, color: '#ff4081', bgcolor: 'rgba(255,64,129,0.10)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,64,129,0.18)' } }}>
        <EmojiEmotionsIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { p: 1, bgcolor: '#23262b', borderRadius: 2, boxShadow: '0 2px 16px #0007' } }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {REACTIONS.map(emoji => (
            <IconButton key={emoji} size="small" onClick={() => handleReaction(emoji)} sx={{ fontSize: 22, color: '#fff', bgcolor: 'transparent', '&:hover': { bgcolor: '#181b1c' } }}>
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};
