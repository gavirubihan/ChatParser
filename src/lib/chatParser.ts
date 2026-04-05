// =============================================
// WhatsApp Chat Parser — Robust Multi-Format
// Supports: Android & iOS, 12h & 24h, All locales
// Handles: \u200e LRM, \uFEFF BOM, all dash variants
// =============================================

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'sticker'
  | 'document'
  | 'deleted'
  | 'system'
  | 'gif'
  | 'contact'
  | 'location';

export interface ChatMessage {
  id: string;
  sessionId: string;
  timestamp: Date;
  sender: string;
  content: string;
  type: MessageType;
  fileName?: string;
  mediaKey?: string;
}

export interface ParsedChat {
  messages: ChatMessage[];
  participants: string[];
  name?: string;
  isGroup: boolean;
}

// =============================================
// Invisible / special chars that WhatsApp inserts
// =============================================
// \u200e = Left-to-Right Mark (LRM) — very common in WhatsApp exports
// \u200f = Right-to-Left Mark (RLM)
// \uFEFF = BOM (Byte Order Mark)
// \u202a–\u202e = directional formatting chars
// \u2066–\u2069 = directional isolate chars
const INVISIBLE_CHARS = /[\u200e\u200f\uFEFF\u202a-\u202e\u2066-\u2069]/g;

// Dash variants: hyphen, en-dash, em-dash, minus sign
const DASH = '[-\u2013\u2014\u2212]';

// Date separator chars (slash, dot, hyphen)
const DATE_SEP = '[\\/\\.\\-]';

// Date part: 1-4 digits + sep + 1-2 digits + sep + 1-4 digits
const DATE_PAT = `\\d{1,4}${DATE_SEP}\\d{1,2}${DATE_SEP}\\d{1,4}`;

// Time part 24h: HH:MM or HH:MM:SS
const TIME_24 = `\\d{1,2}:\\d{2}(?::\\d{2})?`;

// Time part 12h: H:MM am/pm or H:MM:SS am/pm (with optional space)
const TIME_12 = `\\d{1,2}:\\d{2}(?::\\d{2})?\\s*[AaPp][Mm]`;

// =============================================
// Core Regex Patterns (applied to cleaned lines)
// =============================================

// Android format: "DD/MM/YYYY, HH:MM - Sender: message"
// or             "DD/MM/YYYY, HH:MM:SS - Sender: message"
const ANDROID_24H_MSG = new RegExp(
  `^(${DATE_PAT}),?\\s+(${TIME_24})\\s*${DASH}\\s+(.+?):\\s(.*)$`
);
const ANDROID_12H_MSG = new RegExp(
  `^(${DATE_PAT}),?\\s+(${TIME_12})\\s*${DASH}\\s+(.+?):\\s(.*)$`
);

// iOS format: "[DD/MM/YYYY, HH:MM:SS] Sender: message"
const IOS_24H_MSG = new RegExp(
  `^\\[(${DATE_PAT}),?\\s+(${TIME_24})\\]\\s+(.+?):\\s(.*)$`
);
const IOS_12H_MSG = new RegExp(
  `^\\[(${DATE_PAT}),?\\s+(${TIME_12})\\]\\s+(.+?):\\s(.*)$`
);

// System messages (no sender colon)
const ANDROID_24H_SYS = new RegExp(
  `^(${DATE_PAT}),?\\s+(${TIME_24})\\s*${DASH}\\s+(.+)$`
);
const ANDROID_12H_SYS = new RegExp(
  `^(${DATE_PAT}),?\\s+(${TIME_12})\\s*${DASH}\\s+(.+)$`
);
const IOS_24H_SYS = new RegExp(
  `^\\[(${DATE_PAT}),?\\s+(${TIME_24})\\]\\s+(.+)$`
);
const IOS_12H_SYS = new RegExp(
  `^\\[(${DATE_PAT}),?\\s+(${TIME_12})\\]\\s+(.+)$`
);

// =============================================
// Media / content type patterns
// =============================================
const MEDIA_PATTERNS: { pattern: RegExp; type: MessageType }[] = [
  { pattern: /\.(jpg|jpeg|png|webp|heic|heif)(\s|$)/i,           type: 'image' },
  { pattern: /\.(mp4|mov|mkv|avi|3gp|m4v)(\s|$)/i,               type: 'video' },
  { pattern: /\.(mp3|ogg|opus|m4a|aac|wav|amr)(\s|$)/i,          type: 'audio' },
  { pattern: /\.(gif)(\s|$)/i,                                    type: 'gif' },
  { pattern: /\.(vcf)(\s|$)/i,                                    type: 'contact' },
  { pattern: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z)(\s|$)/i, type: 'document' },
];

const ATTACHMENT_PLACEHOLDER = /<attached:\s*(.+?)>|(.+?)\s*\(file attached\)/i;
const OMITTED_PLACEHOLDER    = /(image|video|audio|sticker|gif|document|voice message)\s+omitted/i;
const DELETED_MSG            = /<this message was deleted>|this message was deleted|you deleted this message/i;
const LOCATION_MSG           = /location:\s*https?:\/\//i;

// =============================================
// Clean a line: strip invisible chars & trim
// =============================================
function cleanLine(line: string): string {
  return line.replace(INVISIBLE_CHARS, '').trim();
}

// =============================================
// Date Parsing — handles DD/MM/YY, MM/DD/YY, YYYY/MM/DD etc.
// =============================================
function parseDate(datePart: string, timePart: string): Date {
  // Normalize all separators to /
  const d = datePart.replace(/[.\-]/g, '/').trim();
  const t = timePart.trim();
  const parts = d.split('/');

  if (parts.length !== 3) return new Date(NaN);

  const a = parseInt(parts[0], 10);
  const b = parseInt(parts[1], 10);
  const c = parseInt(parts[2], 10);

  let day: number, month: number, year: number;

  if (a > 31) {
    // YYYY/MM/DD
    year = a;
    month = b;
    day = c;
  } else {
    year = c < 100 ? c + 2000 : c;
    // WhatsApp uses DD/MM/YY or MM/DD/YY depending on locale
    // If 'a' is > 12, it must be day (DD/MM)
    // If 'b' is > 12, it must be day — meaning MM/DD impossible, use a=month, b=day → swap
    // Default: treat as DD/MM/YYYY (most common globally)
    if (a > 12) {
      day = a; month = b;
    } else if (b > 12) {
      // b is day → must be MM/DD/YYYY
      month = a; day = b;
    } else {
      // Ambiguous — default to DD/MM/YYYY (international standard for WhatsApp)
      day = a; month = b;
    }
  }

  const timeStr = normalizeTime(t);
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${timeStr}`;
  const date = new Date(dateStr);

  return isNaN(date.getTime()) ? new Date() : date;
}

function normalizeTime(time: string): string {
  const s = time.trim();
  const lower = s.toLowerCase();
  const isPM = lower.endsWith('pm') || lower.includes(' pm');
  const isAM = lower.endsWith('am') || lower.includes(' am');

  const cleaned = s.replace(/\s*[ap]m\s*/i, '').trim();
  const parts = cleaned.split(':');

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
  const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// =============================================
// Message type detection
// =============================================
function detectMessageType(content: string): { type: MessageType; fileName?: string } {
  const c = content.replace(INVISIBLE_CHARS, '').trim();

  if (DELETED_MSG.test(c)) return { type: 'deleted' };
  if (LOCATION_MSG.test(c)) return { type: 'location' };

  // "<attached: filename.jpg>" or "filename.jpg (file attached)"
  const attachedMatch = c.match(ATTACHMENT_PLACEHOLDER);
  if (attachedMatch) {
    const fileName = (attachedMatch[1] || attachedMatch[2] || '').trim();
    for (const { pattern, type } of MEDIA_PATTERNS) {
      if (pattern.test(fileName)) return { type, fileName };
    }
    // Treat webp as sticker if standalone
    if (/\.webp(\s|$)/i.test(fileName)) return { type: 'sticker', fileName };
    return { type: 'document', fileName };
  }

  // "image omitted" / "video omitted" style (WhatsApp web)
  const omittedMatch = c.match(OMITTED_PLACEHOLDER);
  if (omittedMatch) {
    const t = omittedMatch[1].toLowerCase().replace(/\s+/g, '_');
    const typeMap: Record<string, MessageType> = {
      image: 'image', video: 'video', audio: 'audio',
      sticker: 'sticker', gif: 'gif', document: 'document',
      voice_message: 'audio',
    };
    return { type: typeMap[t] ?? 'document' };
  }

  return { type: 'text' };
}

// =============================================
// Line matching — tries all patterns on cleaned line
// =============================================
interface ParsedLine {
  date: string;
  time: string;
  sender: string | null;
  content: string;
  isSystem: boolean;
}

function matchLine(rawLine: string): ParsedLine | null {
  const line = cleanLine(rawLine);
  if (!line) return null;

  let m: RegExpMatchArray | null;

  // --- Message lines (with sender) ---

  // iOS 12h
  m = line.match(IOS_12H_MSG);
  if (m) return { date: m[1], time: m[2], sender: m[3].trim(), content: m[4], isSystem: false };

  // iOS 24h
  m = line.match(IOS_24H_MSG);
  if (m) return { date: m[1], time: m[2], sender: m[3].trim(), content: m[4], isSystem: false };

  // Android 12h
  m = line.match(ANDROID_12H_MSG);
  if (m) return { date: m[1], time: m[2], sender: m[3].trim(), content: m[4], isSystem: false };

  // Android 24h
  m = line.match(ANDROID_24H_MSG);
  if (m) return { date: m[1], time: m[2], sender: m[3].trim(), content: m[4], isSystem: false };

  // --- System messages (no sender colon) ---
  // Only match if it doesn't also match a message pattern (checked above already)

  m = line.match(IOS_12H_SYS);
  if (m) return { date: m[1], time: m[2], sender: null, content: m[3].trim(), isSystem: true };

  m = line.match(IOS_24H_SYS);
  if (m) return { date: m[1], time: m[2], sender: null, content: m[3].trim(), isSystem: true };

  m = line.match(ANDROID_12H_SYS);
  if (m) return { date: m[1], time: m[2], sender: null, content: m[3].trim(), isSystem: true };

  m = line.match(ANDROID_24H_SYS);
  if (m) return { date: m[1], time: m[2], sender: null, content: m[3].trim(), isSystem: true };

  return null;
}

// =============================================
// ID Generator
// =============================================
let idCounter = 0;
function generateId(sessionId: string): string {
  return `${sessionId}-msg-${++idCounter}`;
}

// =============================================
// Main Parser
// =============================================
export function parseWhatsAppChat(text: string, sessionId: string): ParsedChat {
  idCounter = 0;

  // Strip BOM from start of file
  const cleanText = text.replace(/^\uFEFF/, '');

  // Normalize line endings
  const lines = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  const messages: ChatMessage[] = [];
  const participantSet = new Set<string>();

  let currentParsed: ParsedLine | null = null;
  let currentLines: string[] = [];

  function flushMessage() {
    if (!currentParsed) return;

    const content = currentLines
      .join('\n')
      .replace(INVISIBLE_CHARS, ' ')    // replace invisible chars with space
      .replace(/ +/g, ' ')              // collapse multiple spaces
      .trim();

    if (!content) return;

    const timestamp = parseDate(currentParsed.date, currentParsed.time);
    const sender = currentParsed.sender ?? 'System';
    const isSystem = currentParsed.isSystem || !currentParsed.sender;

    if (sender && sender !== 'System') {
      participantSet.add(sender);
    }

    const { type, fileName } = isSystem
      ? { type: 'system' as MessageType, fileName: undefined }
      : detectMessageType(content);

    messages.push({
      id: generateId(sessionId),
      sessionId,
      timestamp,
      sender,
      content,
      type,
      fileName,
    });
  }

  for (const rawLine of lines) {
    const parsed = matchLine(rawLine);
    if (parsed) {
      flushMessage();
      currentParsed = parsed;
      currentLines = [parsed.content];
    } else if (currentParsed) {
      // Continuation (multi-line message)
      currentLines.push(cleanLine(rawLine));
    }
    // Lines before the first timestamped message are ignored
  }
  flushMessage();

  const participants = Array.from(participantSet);
  // Group if more than 2 unique senders
  const isGroup = participants.length > 2;

  return { messages, participants, isGroup };
}
