import { useState, useEffect, useCallback } from 'react';
import { getMessages, getAllSessions, deleteSession } from '../lib/storage';
import type { ChatSession } from '../lib/storage';
import type { ChatMessage } from '../lib/chatParser';

// =============================================
// useAllSessions — loads list of all chats
// =============================================
export function useAllSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSessions();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeSession = useCallback(async (id: string) => {
    await deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  return { sessions, loading, reload: load, removeSession };
}

// =============================================
// useMessages — loads messages for a session
// =============================================
export function useMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMessages(sessionId)
      .then(msgs => {
        if (!cancelled) setMessages(msgs);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [sessionId]);

  return { messages, loading, error };
}
