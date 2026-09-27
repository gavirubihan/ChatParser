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
  // Track which session IDs are being deleted in the background
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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
    // Optimistic update — remove instantly from UI
    setSessions(prev => prev.filter(s => s.id !== id));
    setDeletingIds(prev => new Set([...prev, id]));
    try {
      await deleteSession(id, () => {});
    } catch {
      // On failure, reload to restore accurate state
      const data = await getAllSessions();
      setSessions(data);
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  return { sessions, loading, isDeleting: false, deleteProgress: 0, deletingIds, reload: load, removeSession };
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
