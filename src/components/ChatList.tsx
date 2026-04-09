import { useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { VList, type VListHandle } from 'virtua';
import type { ChatMessage } from '../lib/chatParser';
import { ChatBubble } from './ChatBubble';
import { getSenderColor } from '../lib/colorUtils';
import { DateSeparator } from './DateSeparator';
import { formatDate } from '../lib/mediaUtils';
import { AdsterraAd } from './AdsterraAd';
import './ChatList.css';

// =============================================
// Configuration
// =============================================
const AD_URL = import.meta.env.VITE_ADSTERRA_URL;
const AD_INTERVAL = 40; // Every 40 messages

// =============================================
// List Item Types
// =============================================
type ListItem =
  | { kind: 'date'; label: string; key: string }
  | { kind: 'message'; message: ChatMessage; key: string }
  | { kind: 'ad'; key: string; side: 'left' | 'right' };

// =============================================
// Build Flat Item List (insert date separators)
// =============================================
function buildItems(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDateLabel = '';
  let msgCounter = 0;

  for (const msg of messages) {
    const label = formatDate(msg.timestamp);
    if (label !== lastDateLabel) {
      items.push({ kind: 'date', label, key: `date-${msg.id}` });
      lastDateLabel = label;
    }
    items.push({ kind: 'message', message: msg, key: msg.id });
    msgCounter++;

    // Inject ad every AD_INTERVAL messages
    if (msgCounter % AD_INTERVAL === 0) {
      const adIndex = Math.floor(msgCounter / AD_INTERVAL);
      items.push({
        kind: 'ad',
        key: `ad-${msg.id}`,
        side: adIndex % 2 === 0 ? 'right' : 'left'
      });
    }
  }

  return items;
}

// =============================================
// Props
// =============================================
interface ChatListProps {
  messages: ChatMessage[];
  participants: string[];
  isGroup: boolean;
  myName?: string;
  searchQuery?: string;
  highlightedMessageId?: string;
  onMediaClick?: (mediaKey: string, type: string, url?: string | null) => void;
}

export interface ChatListHandle {
  scrollToBottom: () => void;
  scrollToMessage: (messageId: string) => void;
}

// =============================================
// Determine "own" sender heuristically
// =============================================
function inferOwnSender(participants: string[]): string {
  const youVariants = ['you', 'yo', 'ich', 'moi', 'eu'];
  for (const p of participants) {
    if (youVariants.includes(p.toLowerCase())) return p;
  }
  return participants[participants.length - 1] ?? '';
}

// =============================================
// ChatList Component
// =============================================
export const ChatList = forwardRef<ChatListHandle, ChatListProps>(({
  messages,
  participants,
  isGroup,
  searchQuery,
  highlightedMessageId,
  onMediaClick,
}, ref) => {
  const virtuosoRef = useRef<VListHandle>(null);

  // Items in chronological order (oldest first, newest last = bottom)
  const items = useMemo(() => buildItems(messages), [messages]);
  const ownSender = useMemo(() => inferOwnSender(participants), [participants]);

  // Scroll to bottom on initial mount
  useEffect(() => {
    if (items.length > 0) {
      virtuosoRef.current?.scrollToIndex(items.length - 1, { align: 'end' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once on mount

  useImperativeHandle(ref, () => ({
    scrollToBottom() {
      // Newest message is at the end of the array
      virtuosoRef.current?.scrollToIndex(items.length - 1, { align: 'end', smooth: true });
    },
    scrollToMessage(messageId: string) {
      const idx = items.findIndex(x => x.kind === 'message' && x.message.id === messageId);
      if (idx !== -1) {
        virtuosoRef.current?.scrollToIndex(idx, { align: 'center', smooth: true });
      }
    },
  }), [items]);

  const renderItem = (item: ListItem, index: number) => {
    if (item.kind === 'date') {
      return <DateSeparator key={item.key} label={item.label} />;
    }

    if (item.kind === 'ad') {
      return <AdsterraAd adUrl={AD_URL} side={item.side} key={item.key} />;
    }

    const { message } = item;
    const isOwn = message.sender === ownSender;

    const prevItem = items[index - 1];
    const showSender = isGroup && !isOwn && (
      prevItem?.kind === 'date' ||
      prevItem?.kind !== 'message' ||
      prevItem.message.sender !== message.sender
    );

    return (
      <div key={message.id} id={`msg-${message.id}`}>
        <ChatBubble
          message={message}
          isOwn={isOwn}
          showSender={showSender}
          isGroup={isGroup}
          searchQuery={searchQuery}
          isHighlighted={message.id === highlightedMessageId}
          onMediaClick={onMediaClick}
          senderColor={getSenderColor(message.sender)}
        />
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="chat-list__empty">
        <div className="chat-list__empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <p>No messages found</p>
        <p className="chat-list__empty-sub">Try adjusting your search filters or media type</p>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <VList
        ref={virtuosoRef}
        style={{ height: '100%', overflowX: 'hidden' }}
        shift={true}
      >
        {items.map((item, index) => renderItem(item, index))}
      </VList>
    </div>
  );
});

ChatList.displayName = 'ChatList';
