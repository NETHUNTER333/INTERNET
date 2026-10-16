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

const SESSION_ID = `zeno-session`;

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
        .limit(100);

      if (error || !data) {
        setMessages([]);
        return;
      }
      setMessages(data as ChatHistoryMessage[]);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string, toolLogs?: string[]) => {
    const newMsg: ChatHistoryMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      session_id: SESSION_ID,
      role,
      content,
      tool_logs: toolLogs && toolLogs.length > 0 ? toolLogs : undefined,
      created_at: new Date().toISOString(),
    };

    // Instant local state update for zero lag!
    setMessages((prev) => [...prev, newMsg]);

    try {
      await supabase.from('chat_history').insert({
        session_id: SESSION_ID,
        role,
        content,
        tool_logs: toolLogs || null,
      });
    } catch (err) {
      console.warn('Chat history persistence error:', err);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    try {
      await supabase.from('chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // silently handle
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { messages, loading, saveMessage, clearHistory, loadHistory };
}
