import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { ChatMessage, MessageType } from './chatParser';

// =============================================
// Database Schema
// =============================================
export interface ChatSession {
  id: string;
  name: string;
  participants: string[];
  messageCount: number;
  isGroup: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  size: number; // bytes
}

interface CV_DB {
  sessions: {
    key: string;
    value: ChatSession;
  };
  messages: {
    key: string;
    value: ChatMessage;
    indexes: {
      'by-session': string;
      'by-session-timestamp': [string, number];
      'by-sender': string;
    };
  };
  media: {
    key: string;
    value: {
      key: string;
      sessionId: string;
      fileName: string;
      blob: Blob;
      mimeType: string;
    };
  };
}

const DB_NAME = 'chatparser';
const DB_VERSION = 3;

let dbInstance: IDBPDatabase<CV_DB> | null = null;

async function getDB(): Promise<IDBPDatabase<CV_DB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CV_DB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
        msgStore.createIndex('by-session', 'sessionId');
        msgStore.createIndex('by-session-timestamp', ['sessionId', 'timestamp']);
        msgStore.createIndex('by-sender', 'sender');
      }
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// =============================================
// Session Operations
// =============================================
export async function getAllSessions(): Promise<ChatSession[]> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSession(id: string): Promise<ChatSession | undefined> {
  const db = await getDB();
  return db.get('sessions', id);
}

export async function saveSession(session: ChatSession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function deleteSession(id: string, onProgress?: (progress: number) => void): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['sessions', 'messages', 'media'], 'readwrite');

  // Delete session - get keys first to report progress
  const msgIndex = tx.objectStore('messages').index('by-session');
  const msgKeys = await msgIndex.getAllKeys(id);

  // For media, we have to iterate all keys since there's no index
  const mediaStore = tx.objectStore('media');
  const allMediaKeys = await mediaStore.getAllKeys();
  const mediaKeysToDelete = allMediaKeys.filter(key => String(key).startsWith(`${id}::`));

  const totalItems = 1 + msgKeys.length + mediaKeysToDelete.length;
  let processed = 0;

  const report = (count: number) => {
    processed += count;
    if (onProgress) {
      onProgress(Math.round((processed / totalItems) * 100));
    }
  };

  // 1. Delete session record
  await tx.objectStore('sessions').delete(id);
  report(1);

  // 2. Delete all messages
  for (let i = 0; i < msgKeys.length; i++) {
    await tx.objectStore('messages').delete(msgKeys[i]);
    // Report every 200 messages or at the end
    if (i % 200 === 0 || i === msgKeys.length - 1) {
      onProgress?.(Math.round(((1 + i + 1) / totalItems) * 100));
    }
  }
  processed += msgKeys.length;

  // 3. Delete all media
  for (let i = 0; i < mediaKeysToDelete.length; i++) {
    await mediaStore.delete(mediaKeysToDelete[i]);
    // Report every 20 media items or at the end
    if (i % 20 === 0 || i === mediaKeysToDelete.length - 1) {
      onProgress?.(Math.round(((processed + i + 1) / totalItems) * 100));
    }
  }

  await tx.done;
}

// =============================================
// Message Operations
// =============================================
export async function saveMessages(messages: ChatMessage[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');

  for (const msg of messages) {
    // Serialize timestamp to number for IDB index
    await store.put({ ...msg, timestamp: msg.timestamp });
  }

  await tx.done;
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  const db = await getDB();
  const msgs = await db.getAllFromIndex('messages', 'by-session', sessionId);
  return msgs.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export async function searchMessages(
  sessionId: string,
  query: string,
  type: MessageType | 'all' = 'all',
  fromDate?: Date,
  toDate?: Date
): Promise<ChatMessage[]> {
  const allMessages = await getMessages(sessionId);
  const q = query.toLowerCase().trim();

  return allMessages.filter(msg => {
    const matchesText = q ? msg.content.toLowerCase().includes(q) : true;
    const matchesFrom = fromDate ? msg.timestamp >= fromDate : true;
    const matchesTo = toDate ? msg.timestamp <= toDate : true;
    const matchesType = type !== 'all' ? msg.type === type : true;
    return matchesText && matchesFrom && matchesTo && matchesType;
  });
}

// =============================================
// Media Operations
// =============================================
export async function saveMedia(
  sessionId: string,
  fileName: string,
  blob: Blob,
  mimeType: string
): Promise<string> {
  const db = await getDB();
  const key = `${sessionId}::${fileName}`;
  await db.put('media', { key, sessionId, fileName, blob, mimeType });
  return key;
}

export async function getMedia(mediaKey: string): Promise<Blob | null> {
  const db = await getDB();
  const record = await db.get('media', mediaKey);
  return record?.blob ?? null;
}

export async function getSessionMedia(sessionId: string): Promise<{ key: string; fileName: string; blob: Blob; mimeType: string }[]> {
  const db = await getDB();
  const allMedia = await db.getAll('media');
  return allMedia.filter(m => m.sessionId === sessionId);
}

// =============================================
// Nuke all data (used by session privacy mode)
// =============================================
export async function deleteAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['sessions', 'messages', 'media'], 'readwrite');
  await tx.objectStore('sessions').clear();
  await tx.objectStore('messages').clear();
  await tx.objectStore('media').clear();
  await tx.done;
}

// =============================================
// Storage Estimation
// =============================================
export async function getStorageUsage(): Promise<{ used: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    return { used: usage ?? 0, quota: quota ?? 0 };
  }
  return { used: 0, quota: 0 };
}

