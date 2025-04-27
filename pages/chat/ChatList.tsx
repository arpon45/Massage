import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Badge, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

export interface ChatItem {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  status?: 'pending' | 'accepted';
  isRequestReceiver?: boolean;
}

interface ChatListProps {
  chats: ChatItem[];
  onSelect: (id: string) => void;
  selectedId?: string;
  onAcceptRequest?: (chatId: string) => void;
  onRejectRequest?: (chatId: string) => void;
}

import { useRouter } from 'next/router';

const ChatList: React.FC<ChatListProps> = ({ chats, onSelect, selectedId, onAcceptRequest, onRejectRequest }) => {
  const theme = useTheme();
  const router = useRouter();
  return (
    <List sx={{ width: '100%', p: 0 }}>
      {chats.map((chat) => (
        <motion.div key={chat.id} whileHover={{ scale: 1.03, boxShadow: `0 4px 24px ${theme.palette.primary.main}28` }}>
          <ListItem
            onClick={() => router.push(`/chat/${chat.id}`)}
            selected={selectedId === chat.id}
            sx={{
              bgcolor: selectedId === chat.id ? theme.palette.action.selected : theme.palette.background.paper,
              borderRadius: 3,
              mb: 1.5,
              cursor: 'pointer',
              transition: 'background 0.18s',
              boxShadow: selectedId === chat.id ? `0 2px 12px ${theme.palette.primary.main}22` : 'none',
              position: 'relative',
            }}
          >
            <ListItemAvatar>
              <Badge
                color="primary"
                variant="dot"
                overlap="circular"
                invisible={!chat.unread}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar src={chat.avatarUrl} alt={chat.name} sx={{ width: 46, height: 46, bgcolor: theme.palette.primary.light, fontWeight: 700 }}>
                  {chat.name[0]}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: chat.unread ? 800 : 600, color: theme.palette.text.primary, fontSize: 17 }}>
                    {chat.name}
                  </Typography>
                  {chat.status === 'pending' && (
                    <Typography sx={{ ml: 1, color: 'warning.main', fontWeight: 700, fontSize: 13 }}>
                      (Request Pending)
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15, fontWeight: 500, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.lastMessage}
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: 13, fontWeight: 400 }}>
                    {chat.time}
                  </Typography>
                </Box>
              }
            />
            {/* Accept/Reject buttons for pending requests where user is receiver */}
            {chat.status === 'pending' && chat.isRequestReceiver && (
              <Box sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAcceptRequest && onAcceptRequest(chat.id); }}
                >Accept</Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRejectRequest && onRejectRequest(chat.id); }}
                >Reject</Button>
              </Box>
            )}
          </ListItem>
        </motion.div>
      ))}
    </List>
  );
};

export default ChatList;
