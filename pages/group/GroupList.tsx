import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Badge, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

export interface GroupItem {
  id: string;
  name: string;
  avatarUrl?: string;
  lastActivity: string;
  members: number;
}

interface GroupListProps {
  groups: GroupItem[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

const GroupList: React.FC<GroupListProps> = ({ groups, onSelect, selectedId }) => {
  const theme = useTheme();
  return (
    <List sx={{ width: '100%', p: 0 }}>
      {groups.map((group) => (
        <motion.div key={group.id} whileHover={{ scale: 1.03, boxShadow: `0 4px 24px ${theme.palette.primary.main}28` }}>
          <ListItem
            onClick={() => onSelect(group.id)}
            selected={selectedId === group.id}
            sx={{
              bgcolor: selectedId === group.id ? theme.palette.action.selected : theme.palette.background.paper,
              borderRadius: 3,
              mb: 1.5,
              cursor: 'pointer',
              transition: 'background 0.18s',
              boxShadow: selectedId === group.id ? `0 2px 12px ${theme.palette.primary.main}22` : 'none',
            }}
          >
            <ListItemAvatar>
              <Avatar src={group.avatarUrl} alt={group.name} sx={{ width: 46, height: 46, bgcolor: theme.palette.primary.light, fontWeight: 700 }}>
                {group.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: 17 }}>
                  {group.name}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: 15, fontWeight: 500, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {group.members} members
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.disabled, fontSize: 13, fontWeight: 600, ml: 2 }}>
                    {group.lastActivity}
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

export default GroupList;
