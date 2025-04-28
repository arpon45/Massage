import { supabase } from '../src/utils/supabaseClient';
import { MessageReaction } from './types';

export async function fetchReactionsForMessages(messageIds: string[]): Promise<{ [messageId: string]: MessageReaction[] }> {
  if (messageIds.length === 0) return {};
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .in('message_id', messageIds);
  if (error) return {};
  const grouped: { [messageId: string]: MessageReaction[] } = {};
  (data || []).forEach((reaction: MessageReaction) => {
    if (!grouped[reaction.message_id]) grouped[reaction.message_id] = [];
    grouped[reaction.message_id].push(reaction);
  });
  return grouped;
}

export async function addOrUpdateReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  // Remove any previous reaction by this user for this message with the same emoji
  await supabase.from('reactions').delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji);
  // Insert new reaction
  await supabase.from('reactions').insert({ message_id: messageId, user_id: userId, emoji });
}

export async function removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  await supabase.from('reactions').delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji);
}
