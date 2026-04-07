import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { VirtuosoHandle } from 'react-virtuoso';
import type { ChatMessage } from '../lib/chatParser';
import { ChatBubble } from './ChatBubble';
import { getSenderColor } from '../lib/colorUtils';
import { DateSeparator } from './DateSeparator';
import { formatDate } from '../lib/mediaUtils';
import './ChatList.css';

// =============================================
// List Item Types
// =============================================
type ListItem =
  | { kind: 'date'; label: string; key: string }
  | { kind: 'message'; message: ChatMessage; key: string };

// =============================================
// Build Flat Item List (insert date separators)
// =============================================
function buildItems(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDateLabel = '';

  for (const msg of messages) {
    const label = formatDate(msg.timestamp);
    if (label !== lastDateLabel) {
      items.push({ kind: 'date', label, key: `date-${msg.id}` });
      lastDateLabel = label;
    }
    items.push({ kind: 'message', message: msg, key: msg.id });
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
  myName?: string; // The "own" sender — typically the last participant or set by heuristic
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
// In WhatsApp exports, the last unique participant is typically "you"
// (Some exports use "You" explicitly)
// =============================================
function inferOwnSender(participants: string[]): string {
  // WhatsApp sometimes uses "You" or the user's own name last
  const youVariants = ['you', 'yo', 'ich', 'moi', 'eu'];
  for (const p of participants) {
    if (youVariants.includes(p.toLowerCase())) return p;
  }
  // Heuristic: last participant in the list
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
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const items = buildItems(messages);
  const ownSender = inferOwnSender(participants);

  useImperativeHandle(ref, () => ({
    scrollToBottom() {
      virtuosoRef.current?.scrollToIndex({ index: items.length - 1, behavior: 'smooth' });
    },
    scrollToMessage(messageId: string) {
      const idx = items.findIndex(item => item.kind === 'message' && item.message.id === messageId);
      if (idx !== -1) {
        virtuosoRef.current?.scrollToIndex({ index: idx, behavior: 'smooth', align: 'center' });
      }
    },
  }), [items]);

  const renderItem = useCallback((index: number) => {
    const item = items[index];
    if (!item) return null;

    if (item.kind === 'date') {
      return <DateSeparator key={item.key} label={item.label} />;
    }

    const { message } = item;
    const isOwn = message.sender === ownSender;

    // Show sender name chip only when sender changes from previous message
    const prevItem = items[index - 1];
    const showSender = isGroup && !isOwn && (
      prevItem?.kind === 'date' ||
      prevItem?.kind !== 'message' ||
      prevItem.message.sender !== message.sender
    );

    return (
      <ChatBubble
        key={message.id}
        message={message}
        isOwn={isOwn}
        showSender={showSender}
        isGroup={isGroup}
        searchQuery={searchQuery}
        isHighlighted={message.id === highlightedMessageId}
        onMediaClick={onMediaClick}
        senderColor={getSenderColor(message.sender)}
      />
    );
  }, [items, ownSender, isGroup, searchQuery, highlightedMessageId, onMediaClick]);

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
      <Virtuoso
        ref={virtuosoRef}
        totalCount={items.length}
        itemContent={renderItem}
        initialTopMostItemIndex={items.length - 1}
        className="chat-list__scroller"
        overscan={800}
      />
    </div>
  );
});

ChatList.displayName = 'ChatList';
