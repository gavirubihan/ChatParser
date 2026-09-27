import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '../lib/chatParser';

// =============================================
// Types
// =============================================
export interface MessageNote {
  messageId: string;
  note: string;
  createdAt: string;
}

export interface MessageGroup {
  id: string;
  name: string;
  messageIds: string[];
  actionType: 'bookmarked' | 'noted';
  note?: string;
  createdAt: string;
}

export interface MessageActionsState {
  bookmarked: Set<string>;
  notes: Record<string, MessageNote>;
  selected: Set<string>;
}

const STORAGE_KEY = (sessionId: string) => `chatparser-msg-actions-${sessionId}`;

interface StoredData {
  bookmarked: string[];
  starred?: string[];
  notes: Record<string, MessageNote>;
  groups: MessageGroup[];
  deleted?: string[];
}

function load(sessionId: string): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(sessionId));
    if (!raw) return { bookmarked: [], notes: {}, groups: [], deleted: [] };
    const parsed = JSON.parse(raw) as StoredData;
    return { ...parsed, groups: parsed.groups ?? [], deleted: parsed.deleted ?? [] };
  } catch {
    return { bookmarked: [], notes: {}, groups: [], deleted: [] };
  }
}

function save(sessionId: string, data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY(sessionId), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

// =============================================
// Hook
// =============================================
export function useMessageActions(sessionId: string | null | undefined) {
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, MessageNote>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const deletedRef = useRef(deleted);
  deletedRef.current = deleted;

  // Load from localStorage when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setBookmarked(new Set());
      setNotes({});
      setSelected(new Set());
      setDeleted(new Set());
      deletedRef.current = new Set();
      return;
    }
    const data = load(sessionId);
    // Backward-compatibility: seamlessly merge any previous starred messages into bookmarks
    const initialBookmarks = new Set(data.bookmarked ?? []);
    if (data.starred && Array.isArray(data.starred)) {
      data.starred.forEach(id => initialBookmarks.add(id));
    }
    setBookmarked(initialBookmarks);
    setNotes(data.notes ?? {});
    setSelected(new Set());
    const initialGroups = (data.groups ?? []).map(g => (
      (g.actionType as string) === 'starred' ? { ...g, actionType: 'bookmarked' as const } : g
    ));
    setGroups(initialGroups);
    const initialDeleted = new Set(data.deleted ?? []);
    setDeleted(initialDeleted);
    deletedRef.current = initialDeleted;
  }, [sessionId]);

  // Persist helper
  const persist = useCallback(
    (nb: Set<string>, nn: Record<string, MessageNote>, ng: MessageGroup[], nd?: Set<string>) => {
      if (!sessionId) return;
      save(sessionId, {
        bookmarked: Array.from(nb),
        notes: nn,
        groups: ng,
        deleted: Array.from(nd ?? deletedRef.current),
      });
    },
    [sessionId]
  );

  // Toggle bookmark
  const toggleBookmark = useCallback(
    (messageId: string) => {
      setBookmarked(prev => {
        const next = new Set(prev);
        if (next.has(messageId)) next.delete(messageId);
        else next.add(messageId);
        persist(next, notes, groups);
        return next;
      });
    },
    [notes, groups, persist]
  );

  // Save note
  const saveNote = useCallback(
    (messageId: string, note: string) => {
      setNotes(prev => {
        let next: Record<string, MessageNote>;
        if (!note.trim()) {
          next = { ...prev };
          delete next[messageId];
        } else {
          next = {
            ...prev,
            [messageId]: {
              messageId,
              note: note.trim(),
              createdAt: prev[messageId]?.createdAt ?? new Date().toISOString(),
            },
          };
        }
        persist(bookmarked, next, groups);
        return next;
      });
    },
    [bookmarked, groups, persist]
  );

  // Toggle selection
  const toggleSelect = useCallback((messageId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  // Remove bookmark
  const removeBookmark = useCallback(
    (messageId: string) => {
      setBookmarked(prev => {
        const next = new Set(prev);
        next.delete(messageId);
        persist(next, notes, groups);
        return next;
      });
    },
    [notes, groups, persist]
  );

  // Remove note
  const removeNote = useCallback(
    (messageId: string) => {
      setNotes(prev => {
        const next = { ...prev };
        delete next[messageId];
        persist(bookmarked, next, groups);
        return next;
      });
    },
    [bookmarked, groups, persist]
  );

  // ── Group actions ──────────────────────────────────────────────────────
  /** Create a named group from the currently selected messages. Title is strictly required. */
  const createGroup = useCallback(
    (name: string, messageIds: string[], actionType: MessageGroup['actionType'], note?: string) => {
      const trimmedName = name.trim();
      if (!trimmedName || messageIds.length === 0) return;

      const newGroup: MessageGroup = {
        id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        messageIds,
        actionType,
        note: note?.trim(),
        createdAt: new Date().toISOString(),
      };

      // Also apply the action to each message individually
      if (actionType === 'bookmarked') {
        setBookmarked(prev => {
          const next = new Set(prev);
          messageIds.forEach(id => next.add(id));
          const ng = [...groups, newGroup];
          setGroups(ng);
          persist(next, notes, ng);
          return next;
        });
      } else if (actionType === 'noted' && note) {
        setNotes(prev => {
          const next = { ...prev };
          const ts = new Date().toISOString();
          messageIds.forEach(id => {
            next[id] = { messageId: id, note: note.trim(), createdAt: ts };
          });
          const ng = [...groups, newGroup];
          setGroups(ng);
          persist(bookmarked, next, ng);
          return next;
        });
      }
    },
    [bookmarked, notes, groups, persist]
  );

  /** Delete a group. If removeAssociatedActions is true (default), also removes the bookmarks/notes for the messages in that group. */
  const deleteGroup = useCallback(
    (groupId: string, removeAssociatedActions: boolean = true) => {
      const targetGroup = groups.find(g => g.id === groupId);
      const nextGroups = groups.filter(g => g.id !== groupId);
      setGroups(nextGroups);

      if (targetGroup && removeAssociatedActions) {
        if (targetGroup.actionType === 'bookmarked') {
          setBookmarked(prev => {
            const next = new Set(prev);
            targetGroup.messageIds.forEach(id => next.delete(id));
            persist(next, notes, nextGroups);
            return next;
          });
        } else if (targetGroup.actionType === 'noted') {
          setNotes(prev => {
            const next = { ...prev };
            targetGroup.messageIds.forEach(id => delete next[id]);
            persist(bookmarked, next, nextGroups);
            return next;
          });
        }
      } else {
        persist(bookmarked, notes, nextGroups);
      }
    },
    [groups, bookmarked, notes, persist]
  );

  /** Delete a single message from the view */
  const deleteMessageFromView = useCallback((messageId: string) => {
    // Compute next state values imperatively — no nested setState calls
    const nextDeleted = new Set(deletedRef.current);
    nextDeleted.add(messageId);
    deletedRef.current = nextDeleted;

    const nextBookmarked = new Set(bookmarked);
    nextBookmarked.delete(messageId);

    const nextNotes = { ...notes };
    delete nextNotes[messageId];

    // Apply all state updates independently (no nesting)
    setDeleted(nextDeleted);
    setBookmarked(nextBookmarked);
    setNotes(nextNotes);
    setSelected(prev => {
      if (!prev.has(messageId)) return prev;
      const next = new Set(prev);
      next.delete(messageId);
      return next;
    });

    persist(nextBookmarked, nextNotes, groups, nextDeleted);
  }, [bookmarked, notes, groups, persist]);

  /** Delete all currently selected messages from view */
  const deleteSelectedFromView = useCallback(() => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    // Compute next state values imperatively — no nested setState calls
    const nextDeleted = new Set(deletedRef.current);
    ids.forEach(id => nextDeleted.add(id));
    deletedRef.current = nextDeleted;

    const nextBookmarked = new Set(bookmarked);
    ids.forEach(id => nextBookmarked.delete(id));

    const nextNotes = { ...notes };
    ids.forEach(id => delete nextNotes[id]);

    // Apply all state updates independently (no nesting)
    setDeleted(nextDeleted);
    setBookmarked(nextBookmarked);
    setNotes(nextNotes);
    setSelected(new Set());

    persist(nextBookmarked, nextNotes, groups, nextDeleted);
  }, [selected, bookmarked, notes, groups, persist]);

  /** Restore previously deleted messages back into view */
  const restoreMessages = useCallback((messageIds: string[]) => {
    setDeleted(prev => {
      const next = new Set(prev);
      messageIds.forEach(id => next.delete(id));
      deletedRef.current = next;
      persist(bookmarked, notes, groups, next);
      return next;
    });
  }, [bookmarked, notes, groups, persist]);

  /** Restore all deleted messages */
  const restoreAllDeleted = useCallback(() => {
    const next = new Set<string>();
    setDeleted(next);
    deletedRef.current = next;
    persist(bookmarked, notes, groups, next);
  }, [bookmarked, notes, groups, persist]);

  /** Backward-compatible alias for deleting selected messages */
  const deleteSelected = deleteSelectedFromView;

  // Stable helper callbacks — avoids new function references on every render
  const isBookmarked = useCallback((id: string) => bookmarked.has(id), [bookmarked]);
  const isSelected = useCallback((id: string) => selected.has(id), [selected]);
  const isDeleted = useCallback((id: string) => deleted.has(id), [deleted]);
  const hasNote = useCallback((id: string) => id in notes, [notes]);
  const getNote = useCallback((id: string) => notes[id]?.note ?? '', [notes]);
  const getSelectedIds = useCallback(() => Array.from(selected), [selected]);

  return {
    bookmarked,
    notes,
    selected,
    groups,
    deleted,
    toggleBookmark,
    saveNote,
    toggleSelect,
    clearSelection,
    removeBookmark,
    removeNote,
    createGroup,
    deleteGroup,
    deleteSelected,
    deleteMessageFromView,
    deleteSelectedFromView,
    restoreMessages,
    restoreAllDeleted,
    // Stable helper callbacks
    isBookmarked,
    isSelected,
    isDeleted,
    hasNote,
    getNote,
    getSelectedIds,
    bookmarkedCount: bookmarked.size,
    notesCount: Object.keys(notes).length,
    selectedCount: selected.size,
    groupsCount: groups.length,
    deletedCount: deleted.size,
  };
}

export type MessageActionsHook = ReturnType<typeof useMessageActions>;


// =============================================
// Helper: filter messages by action state
// =============================================
export function filterMessagesByAction(
  messages: ChatMessage[],
  bookmarked: Set<string>,
  notes: Record<string, MessageNote>,
  mode: 'bookmarked' | 'noted'
): ChatMessage[] {
  switch (mode) {
    case 'bookmarked':
      return messages.filter(m => bookmarked.has(m.id));
    case 'noted':
      return messages.filter(m => m.id in notes);
    default:
      return [];
  }
}
