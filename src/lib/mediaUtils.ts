// =============================================
// Media Utilities — Blob URL Management
// =============================================
import { getMedia } from './storage';

// =============================================
// Concurrency Queue — max 3 simultaneous IDB reads
// Prevents the browser from stalling when many
// images scroll into view at the same time on a large chat.
// =============================================
let _activeReads = 0;
const _readQueue: (() => void)[] = [];
const MAX_CONCURRENT_READS = 3;

function acquireReadSlot(): Promise<void> {
  return new Promise(resolve => {
    if (_activeReads < MAX_CONCURRENT_READS) {
      _activeReads++;
      resolve();
    } else {
      _readQueue.push(() => { _activeReads++; resolve(); });
    }
  });
}

function releaseReadSlot(): void {
  _activeReads--;
  const next = _readQueue.shift();
  if (next) next();
}

// =============================================
// URL Cache — avoids re-reading blobs from IDB
// =============================================
const urlCache = new Map<string, string>();

export function getCachedMediaUrl(mediaKey: string): string | null {
  return urlCache.get(mediaKey) ?? null;
}

export async function getMediaUrl(mediaKey: string): Promise<string | null> {
  if (urlCache.has(mediaKey)) return urlCache.get(mediaKey)!;

  await acquireReadSlot();
  try {
    const blob = await getMedia(mediaKey);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlCache.set(mediaKey, url);
    return url;
  } finally {
    releaseReadSlot();
  }
}

export function revokeMediaUrl(mediaKey: string): void {
  const url = urlCache.get(mediaKey);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(mediaKey);
  }
}

export function revokeAllMediaUrls(): void {
  for (const url of urlCache.values()) {
    URL.revokeObjectURL(url);
  }
  urlCache.clear();
}

// =============================================
// Format file sizes
// =============================================
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// =============================================
// Format message timestamps
// =============================================
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDay.getTime() === today.getTime()) return 'Today';
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

// =============================================
// MIME type extraction from blob
// =============================================
export function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isVideoMime(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function isAudioMime(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}
