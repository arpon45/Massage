import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Box, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';

export interface CallItem {
  id: string;
  name: string;
  avatarUrl?: string;
  type: 'voice' | 'video';
  time: string;
  missed?: boolean;
}

interface CallListProps {
  calls: CallItem[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

const CallList: React.FC<CallListProps> = ({ calls, onSelect, selectedId }) => {
  const theme = useTheme();
  return (
    <List sx={{ width: '100%', p: 0 }}>
      {calls.map((call) => (
        <motion.div key={call.id} whileHover={{ scale: 1.03, boxShadow: `0 4px 24px ${theme.palette.primary.main}28` }}>
          <ListItem
            onClick={() => onSelect(call.id)}
            selected={selectedId === call.id}
            sx={{
              bgcolor: selectedId === call.id ? theme.palette.action.selected : theme.palette.background.paper,
              borderRadius: 3,
              mb: 1.5,
              cursor: 'pointer',
              transition: 'background 0.18s',
              boxShadow: selectedId === call.id ? `0 2px 12px ${theme.palette.primary.main}22` : 'none',
            }}
          >
            <ListItemAvatar>
              <Avatar src={call.avatarUrl} alt={call.name} sx={{ width: 46, height: 46, bgcolor: theme.palette.primary.light, fontWeight: 700 }}>
                {call.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: call.missed ? 800 : 700, color: call.missed ? theme.palette.error.main : theme.palette.text.primary, fontSize: 17 }}>
                  {call.name}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {call.type === 'video' ? (
                      <VideoCallIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                    ) : (
                      <CallIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    )}
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15, fontWeight: 500 }}>
                      {call.type.charAt(0).toUpperCase() + call.type.slice(1)} call
                    </Typography>
                  </Box>
                  <Typography sx={{ color: call.missed ? theme.palette.error.main : theme.palette.text.disabled, fontSize: 13, fontWeight: 600, ml: 2 }}>
                    {call.time}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </motion.div>
      ))}
    </List>
  );
};

export default CallList;
