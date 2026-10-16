import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChatHistoryMessage {
  id?: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_logs?: string[];
  created_at?: string;
}

const SESSION_ID = `alberto-session`;

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        setMessages([]);
        return;
      }
      setMessages((data || []) as ChatHistoryMessage[]);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string, toolLogs?: string[]) => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          session_id: SESSION_ID,
          role,
          content,
          tool_logs: toolLogs || null,
        })
        .select()
        .single();

      if (error) return;
      if (data) {
        setMessages((prev) => [...prev, data as ChatHistoryMessage]);
      }
    } catch {
      // silently fail - chat still works without persistence
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // silently fail
    }
    setMessages([]);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { messages, loading, saveMessage, clearHistory, loadHistory };
}
