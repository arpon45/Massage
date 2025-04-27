import React from 'react';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatWindow from './ChatWindow';
import { supabase } from '../../src/utils/supabaseClient';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = router.query;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [chatInfo, setChatInfo] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
      if (user?.id) {
        // Fetch the full user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();
        setCurrentUserProfile(profile);
      }
    });
  }, []);

  useEffect(() => {
    if (!chatId || !currentUserId) return;
    supabase
      .from('chat_members')
      .select('chat_id, status, user_id, chats(id, is_group, chat_members(user_id, status, profiles(username, display_name, avatar_url)))')
      .eq('chat_id', chatId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setChatInfo(data[0]);
          const chatArr = data[0].chats;
          const chat = Array.isArray(chatArr) ? chatArr[0] : chatArr;
          const members = chat?.chat_members?.filter((m: any) => m.user_id !== currentUserId);
          const other = members && members.length > 0 ? members[0].profiles : null;
          setOtherUser(other ? { display_name: other.display_name, avatar_url: other.avatar_url } : null);
        }
      });
  }, [chatId, currentUserId]);

  const handleDeleteChat = async () => {
    await supabase.from('chat_members').delete().eq('chat_id', chatId);
    await supabase.from('messages').delete().eq('chat_id', chatId);
    await supabase.from('chats').delete().eq('id', chatId);
    router.replace('/chat');
  };

  if (!chatId || !currentUserId) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 0, sm: 3 } }}>
      <IconButton onClick={() => router.push('/chat')} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>
      <ChatWindow
        chatId={chatId as string}
        currentUserId={currentUserId}
        currentUserAvatarUrl={currentUserProfile?.avatar_url}
        currentUserDisplayName={currentUserProfile?.display_name}
        otherUser={otherUser}
        deleteChat={handleDeleteChat}
      />
    </Box>
  );
}
