import JSZip from 'jszip';
import { parseWhatsAppChat, type ParsedChat } from './chatParser';
import { saveSession, saveMessages, saveMedia } from './storage';
import type { ChatSession } from './storage';

// =============================================
// Utility: Generate UUID
// =============================================
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// =============================================
// Utility: Extract filename without extension
// =============================================
function fileBaseName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
}

// =============================================
// Media MIME Type Detection
// =============================================
function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', heic: 'image/heic',
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
    '3gp': 'video/3gpp', mkv: 'video/x-matroska',
    mp3: 'audio/mpeg', ogg: 'audio/ogg', opus: 'audio/opus',
    m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav',
    pdf: 'application/pdf',
    vcf: 'text/vcard',
  };
  return mimeMap[ext] ?? 'application/octet-stream';
}

export interface ProcessResult {
  sessionId: string;
  session: ChatSession;
  mediaCount: number;
}

// =============================================
// Process .txt File
// =============================================
export async function processTxtFile(file: File): Promise<ProcessResult> {
  const text = await file.text();
  const sessionId = generateId();

  const parsed: ParsedChat = parseWhatsAppChat(text, sessionId);

  const { messages, participants, isGroup } = parsed;

  if (messages.length === 0) {
    throw new Error('No messages found. Please check that this is a valid WhatsApp export file.');
  }

  const timestamps = messages.map(m => m.timestamp.getTime()).filter(t => !isNaN(t));
  const startDate = new Date(Math.min(...timestamps));
  const endDate = new Date(Math.max(...timestamps));

  // Derive chat name from filename
  const rawName = fileBaseName(file.name);
  const name = rawName.replace(/whatsapp chat with|chat with|whatsapp/gi, '').trim() || 
               (isGroup ? 'Group Chat' : participants.join(' & '));

  const session: ChatSession = {
    id: sessionId,
    name: name || 'WhatsApp Chat',
    participants,
    messageCount: messages.length,
    isGroup,
    startDate,
    endDate,
    createdAt: new Date(),
    size: file.size,
  };

  await saveSession(session);
  await saveMessages(messages);

  return { sessionId, session, mediaCount: 0 };
}

// =============================================
// Process .zip File
// =============================================
export async function processZipFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const zip = await JSZip.loadAsync(file);
  const sessionId = generateId();

  // Find the .txt file inside the zip
  let chatFileName = '';
  const mediaFiles: { name: string; file: JSZip.JSZipObject }[] = [];

  // Collect all entries first
  const allEntries: { relativePath: string; entry: JSZip.JSZipObject }[] = [];
  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      allEntries.push({ relativePath, entry: zipEntry });
    }
  });

  // Find the chat .txt file:
  // WhatsApp ZIPs can contain multiple .txt files (e.g. Binder2.txt, group notes, etc.)
  // We must PROBE each one and pick the file that actually contains WhatsApp chat format.
  const WHATSAPP_DATE_PROBE = /^\s*[\u200e\u200f]?\[?\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}/;

  const txtEntries = allEntries.filter(e =>
    e.relativePath.toLowerCase().endsWith('.txt') &&
    !e.relativePath.startsWith('__MACOSX') &&
    !e.relativePath.startsWith('.')
  );

  // Sort: prefer WhatsApp-named files first, then _chat.txt, then shortest path
  txtEntries.sort((a, b) => {
    const aL = a.relativePath.toLowerCase();
    const bL = b.relativePath.toLowerCase();
    // Exact WhatsApp export naming
    const aWA = aL.includes('whatsapp chat') || aL.includes('whatsapp-chat');
    const bWA = bL.includes('whatsapp chat') || bL.includes('whatsapp-chat');
    if (aWA && !bWA) return -1;
    if (bWA && !aWA) return 1;
    if (aL.endsWith('_chat.txt')) return -1;
    if (bL.endsWith('_chat.txt')) return 1;
    return a.relativePath.length - b.relativePath.length;
  });

  if (txtEntries.length === 0) {
    const fileList = allEntries.map(e => e.relativePath).join(', ');
    throw new Error(`No .txt file found in the ZIP. Files found: ${fileList || 'none'}`);
  }

  // Probe each .txt file to find the actual chat file
  let chatText: string = '';
  for (const candidate of txtEntries) {
    try {
      let raw = await candidate.entry.async('string');
      // Strip BOM
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      // Test first 20 lines for WhatsApp date patterns
      const testLines = raw.split('\n').slice(0, 20);
      const hasMatch = testLines.some(line => WHATSAPP_DATE_PROBE.test(line));
      if (hasMatch) {
        chatFileName = candidate.relativePath;
        chatText = raw;
        break;
      }
    } catch {
      // Skip unreadable files
    }
  }

  if (!chatFileName || !chatText) {
    // Last resort: try the first .txt file anyway
    try {
      let raw = await txtEntries[0].entry.async('string');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      chatFileName = txtEntries[0].relativePath;
      chatText = raw;
    } catch {
      throw new Error('Could not read any .txt file from the ZIP archive.');
    }
  }

  // All other non-system files (excluding the chosen chat txt) are media
  for (const { relativePath, entry } of allEntries) {
    if (relativePath !== chatFileName &&
        !relativePath.startsWith('__MACOSX') &&
        !relativePath.startsWith('.')) {
      mediaFiles.push({ name: relativePath.split('/').pop() ?? relativePath, file: entry });
    }
  }

  const parsed: ParsedChat = parseWhatsAppChat(chatText, sessionId);
  const { messages, participants, isGroup } = parsed;

  if (messages.length === 0) {
    // Give a helpful error showing what the first few lines look like
    const preview = chatText.split('\n').slice(0, 5).join(' | ');
    throw new Error(
      `No messages could be parsed from "${chatFileName}". ` +
      `First lines: "${preview.slice(0, 200)}" — ` +
      `This may be an unsupported WhatsApp export format. ` +
      `Ensure you exported using WhatsApp's "Export Chat" feature.`
    );
  }

  // Build media key map: fileName -> mediaKey
  const mediaKeyMap = new Map<string, string>();
  let processed = 0;

  // Save media files
  for (const { name, file: zipFile } of mediaFiles) {
    try {
      const mimeType = getMimeType(name);
      const blob = await zipFile.async('blob');
      const mediaKey = await saveMedia(sessionId, name, new Blob([blob], { type: mimeType }), mimeType);
      mediaKeyMap.set(name, mediaKey);
      mediaKeyMap.set(name.toLowerCase(), mediaKey);
    } catch {
      // Skip unreadable files
    }
    processed++;
    onProgress?.(Math.round((processed / (mediaFiles.length + 1)) * 90));
  }

  // Attach media keys to messages
  for (const msg of messages) {
    if (msg.fileName) {
      const key = mediaKeyMap.get(msg.fileName) ?? mediaKeyMap.get(msg.fileName.toLowerCase());
      if (key) msg.mediaKey = key;
    }
  }

  const timestamps = messages.map(m => m.timestamp.getTime()).filter(t => !isNaN(t));
  const startDate = new Date(Math.min(...timestamps));
  const endDate = new Date(Math.max(...timestamps));

  const rawName = fileBaseName(file.name);
  const name = rawName.replace(/whatsapp chat with|chat with|whatsapp/gi, '').trim() ||
               (isGroup ? 'Group Chat' : participants.join(' & '));

  const session: ChatSession = {
    id: sessionId,
    name: name || 'WhatsApp Chat',
    participants,
    messageCount: messages.length,
    isGroup,
    startDate,
    endDate,
    createdAt: new Date(),
    size: file.size,
  };

  await saveSession(session);
  await saveMessages(messages);
  onProgress?.(100);

  return { sessionId, session, mediaCount: mediaFiles.length };
}

// =============================================
// Auto-detect and process file
// =============================================
export async function processFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const name = file.name.toLowerCase();

  // Sniff the file type using magic bytes (PK for ZIP)
  const buffer = await file.slice(0, 2).arrayBuffer();
  const view = new Uint8Array(buffer);
  const isZipContent = view[0] === 0x50 && view[1] === 0x4B; // 'PK' header

  if (name.endsWith('.zip') || isZipContent) {
    return processZipFile(file, onProgress);
  } else if (name.endsWith('.txt')) {
    onProgress?.(50);
    const result = await processTxtFile(file);
    onProgress?.(100);
    return result;
  } else {
    // If it's not a zip, try processing it as a txt anyway if it's small/readable
    try {
      onProgress?.(50);
      const result = await processTxtFile(file);
      onProgress?.(100);
      return result;
    } catch {
      throw new Error('Unsupported file type. Please upload a .txt or .zip WhatsApp export file.');
    }
  }
}
