import React, { useState, useEffect } from 'react';
import type { ChatMessage } from '../lib/chatParser';
import { getMediaUrl } from '../lib/mediaUtils';
import { formatTime } from '../lib/mediaUtils';
import './ChatBubble.css';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
  isGroup: boolean;
  searchQuery?: string;
  isHighlighted?: boolean;
  onMediaClick?: (mediaKey: string, type: string) => void;
  senderColor?: string;
}

// Consistent colors for group participants
const SENDER_COLORS = [
  '#e91e8c', '#7c4dff', '#00bcd4', '#ff6d00',
  '#4caf50', '#f44336', '#2196f3', '#ff9800',
  '#9c27b0', '#009688', '#795548', '#607d8b',
];

export function getSenderColor(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = sender.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="chat-bubble__highlight">{part}</mark>
    ) : part
  );
}

// =============================================
// Media Content Renderer
// =============================================
const MediaContent: React.FC<{
  message: ChatMessage;
  onMediaClick?: (mediaKey: string, type: string) => void;
}> = ({ message, onMediaClick }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (message.mediaKey) {
      getMediaUrl(message.mediaKey).then(u => {
        if (active) { setUrl(u); setLoading(false); }
      });
    } else {
      setLoading(false);
    }
    return () => { active = false; };
  }, [message.mediaKey]);

  const handleClick = () => {
    if (message.mediaKey && onMediaClick) {
      onMediaClick(message.mediaKey, message.type);
    }
  };

  if (message.type === 'image') {
    if (loading) return <div className="chat-bubble__media-placeholder skeleton" style={{ width: '240px', height: '180px' }} />;
    if (!url) return (
      <div className="chat-bubble__media-unavailable">
        <span className="chat-bubble__media-icon">🖼️</span>
        <span>{message.fileName ?? 'Image'}</span>
      </div>
    );
    return (
      <button className="chat-bubble__media-btn" onClick={handleClick} aria-label="Open image">
        <img src={url} alt={message.fileName ?? 'Image'} className="chat-bubble__image" loading="lazy" />
        <div className="chat-bubble__media-overlay">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
      </button>
    );
  }

  if (message.type === 'video') {
    if (loading) return <div className="chat-bubble__media-placeholder skeleton" style={{ width: '240px', height: '160px' }} />;
    if (!url) return (
      <div className="chat-bubble__media-unavailable">
        <span className="chat-bubble__media-icon">🎥</span>
        <span>{message.fileName ?? 'Video'}</span>
      </div>
    );
    return (
      <button className="chat-bubble__media-btn" onClick={handleClick} aria-label="Open video">
        <video src={url} className="chat-bubble__video" preload="metadata" />
        <div className="chat-bubble__media-overlay">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </button>
    );
  }

  if (message.type === 'audio') {
    if (!url) return (
      <div className="chat-bubble__audio-placeholder">
        <span className="chat-bubble__media-icon">🎵</span>
        <span>{message.fileName ?? 'Audio'}</span>
      </div>
    );
    return (
      <div className="chat-bubble__audio">
        <svg className="chat-bubble__audio-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
        </svg>
        <audio src={url} controls className="chat-bubble__audio-player" />
      </div>
    );
  }

  if (message.type === 'sticker') {
    if (loading) return <div className="chat-bubble__media-placeholder skeleton" style={{ width: '120px', height: '120px' }} />;
    if (!url) return <div className="chat-bubble__media-unavailable"><span>🎭 Sticker</span></div>;
    return <img src={url} alt="Sticker" className="chat-bubble__sticker" />;
  }

  if (message.type === 'gif') {
    if (loading) return <div className="chat-bubble__media-placeholder skeleton" style={{ width: '200px', height: '150px' }} />;
    if (!url) return <div className="chat-bubble__media-unavailable"><span>🎞️ GIF</span></div>;
    return (
      <button className="chat-bubble__media-btn" onClick={handleClick} aria-label="Open GIF">
        <img src={url} alt="GIF" className="chat-bubble__image" />
        <div className="chat-bubble__gif-badge">GIF</div>
      </button>
    );
  }

  if (message.type === 'document') {
    return (
      <div className="chat-bubble__document">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <span className="chat-bubble__document-name">{message.fileName ?? 'Document'}</span>
        {url && (
          <a href={url} download={message.fileName} className="chat-bubble__document-download" onClick={e => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
        )}
      </div>
    );
  }

  if (message.type === 'contact') {
    return (
      <div className="chat-bubble__contact">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>{message.fileName ?? 'Contact'}</span>
      </div>
    );
  }

  if (message.type === 'location') {
    return (
      <div className="chat-bubble__location">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span>Location shared</span>
        <a href={message.content} target="_blank" rel="noopener noreferrer" className="chat-bubble__location-link">View on Map</a>
      </div>
    );
  }

  return null;
};

// =============================================
// Main ChatBubble Component
// =============================================
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  showSender,
  isGroup,
  searchQuery,
  isHighlighted,
  onMediaClick,
}) => {
  const isSystem = message.type === 'system';
  const isDeleted = message.type === 'deleted';
  const hasMedia = ['image', 'video', 'audio', 'sticker', 'gif', 'document', 'contact', 'location'].includes(message.type);
  const isMediaOnly = hasMedia && !message.content.trim();
  const senderColor = getSenderColor(message.sender);

  if (isSystem) {
    return (
      <div className="chat-bubble__system-wrapper">
        <div className="chat-bubble__system">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-bubble__wrapper ${isOwn ? 'chat-bubble__wrapper--own' : 'chat-bubble__wrapper--other'} ${isHighlighted ? 'chat-bubble__wrapper--highlighted' : ''}`}>
      {!isOwn && !isGroup && (
        <div className="chat-bubble__avatar" style={{ backgroundColor: senderColor }} aria-hidden="true">
          {message.sender.charAt(0).toUpperCase()}
        </div>
      )}
      {!isOwn && isGroup && (
        <div className="chat-bubble__avatar" style={{ backgroundColor: senderColor }} aria-hidden="true">
          {message.sender.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`chat-bubble ${isOwn ? 'chat-bubble--own' : 'chat-bubble--other'} ${isMediaOnly ? 'chat-bubble--media-only' : ''} ${isDeleted ? 'chat-bubble--deleted' : ''}`}>
        {/* Sender name (group chats) */}
        {!isOwn && isGroup && showSender && (
          <div className="chat-bubble__sender" style={{ color: senderColor }}>
            {message.sender}
          </div>
        )}

        {/* Media content */}
        {hasMedia && (
          <MediaContent message={message} onMediaClick={onMediaClick} />
        )}

        {/* Text content */}
        {message.content && !isMediaOnly && (
          <div className={`chat-bubble__text ${isDeleted ? 'chat-bubble__text--deleted' : ''}`}>
            {isDeleted ? (
              <span className="chat-bubble__deleted-text">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 4, opacity: 0.7 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                {isOwn ? 'You deleted this message' : 'This message was deleted'}
              </span>
            ) : (
              searchQuery ? highlightText(message.content, searchQuery) : message.content
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="chat-bubble__footer">
          <span className="chat-bubble__time">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="chat-bubble__ticks" aria-label="Delivered" title="Delivered">
              <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                <path d="M11.071.653a.45.45 0 0 0-.63 0L4.5 6.593 1.559 3.652a.45.45 0 0 0-.63.63l3.256 3.256a.45.45 0 0 0 .63 0l6.256-6.256a.45.45 0 0 0 0-.629zM15.441.653a.45.45 0 0 0-.63 0L8.87 6.593 8.2 5.923a.45.45 0 1 0-.636.636l.985.985a.45.45 0 0 0 .636 0l6.256-6.256a.45.45 0 0 0 0-.635z"/>
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
