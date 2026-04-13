import React, { useState, useEffect } from 'react';
import type { ChatMessage } from '../lib/chatParser';
import { getMediaUrl, getCachedMediaUrl } from '../lib/mediaUtils';
import { formatTime } from '../lib/mediaUtils';
import './ChatBubble.css';


import { getSenderColor } from '../lib/colorUtils';

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
  onMediaClick?: (mediaKey: string, type: string, url?: string | null) => void;
}> = React.memo(({ message, onMediaClick }) => {
  const cachedUrl = message.mediaKey ? getCachedMediaUrl(message.mediaKey) : null;
  const [url, setUrl] = useState<string | null>(cachedUrl);
  const [loading, setLoading] = useState(!cachedUrl);

  useEffect(() => {
    // Skip async fetch entirely if we synchronously hit the cache
    if (cachedUrl) return;

    let active = true;
    if (message.mediaKey) {
      getMediaUrl(message.mediaKey).then(u => {
        if (active) { setUrl(u); setLoading(false); }
      });
    } else {
      setLoading(false);
    }
    return () => { active = false; };
  }, [message.mediaKey, cachedUrl]);

  const handleClick = () => {
    if (message.mediaKey && onMediaClick) {
      onMediaClick(message.mediaKey, message.type, url);
    }
  };

  if (message.type === 'image') {
    if (loading) return (
      <div
        className="chat-bubble__media-placeholder skeleton"
        style={{ width: '240px', height: '240px', flexShrink: 0 }}
      />
    );
    if (!url) return (
      <div className="chat-bubble__media-unavailable">
        <span className="chat-bubble__media-icon">🖼️</span>
        <span>{message.fileName ?? 'Image'}</span>
      </div>
    );
    return (
      <button className="chat-bubble__media-btn" onClick={handleClick} aria-label="Open image">
        <img src={url} alt={message.fileName ?? 'Image'} className="chat-bubble__image" decoding="async" />
        <div className="chat-bubble__media-overlay">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      </button>
    );
  }

  if (message.type === 'video') {
    if (loading) return (
      <div
        className="chat-bubble__media-placeholder skeleton"
        style={{ width: '240px', height: '240px', flexShrink: 0 }}
      />
    );
    if (!url) return (
      <div className="chat-bubble__media-unavailable">
        <span className="chat-bubble__media-icon">🎥</span>
        <span>{message.fileName ?? 'Video'}</span>
      </div>
    );
    return (
      <button className="chat-bubble__media-btn" onClick={handleClick} aria-label="Open video">
        <video src={url} className="chat-bubble__video" preload="none" />
        <div className="chat-bubble__media-overlay">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        </div>
      </button>
    );
  }

  if (message.type === 'audio') {
    if (!url) return (
      <div className="chat-bubble__audio-placeholder">
        <svg className="chat-bubble__media-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <span>{message.fileName ?? 'Audio'}</span>
      </div>
    );
    return (
      <div className="chat-bubble__audio">
        <svg className="chat-bubble__audio-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <audio src={url} controls className="chat-bubble__audio-player" />
      </div>
    );
  }

  if (message.type === 'sticker') {
    if (loading) return (
      <div
        className="chat-bubble__media-placeholder skeleton"
        style={{ width: '120px', height: '120px', flexShrink: 0 }}
      />
    );
    if (!url) return <div className="chat-bubble__media-unavailable"><span>🎭 Sticker</span></div>;
    return <img src={url} alt="Sticker" className="chat-bubble__sticker" />;
  }

  if (message.type === 'gif') {
    if (loading) return (
      <div
        className="chat-bubble__media-placeholder skeleton"
        style={{ width: '240px', height: '240px', flexShrink: 0 }}
      />
    );
    if (!url) return <div className="chat-bubble__media-unavailable"><span>🎞️ GIF</span></div>;
    return (
      <button className="chat-bubble__media-btn" onClick={handleClick} aria-label="Open GIF">
        <img src={url} alt="GIF" className="chat-bubble__image" decoding="async" />
        <div className="chat-bubble__gif-badge">GIF</div>
      </button>
    );
  }

  if (message.type === 'document') {
    return (
      <div className="chat-bubble__document">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="chat-bubble__document-name">{message.fileName ?? 'Document'}</span>
        {url && (
          <a href={url} download={message.fileName} className="chat-bubble__document-download" onClick={e => e.stopPropagation()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </a>
        )}
      </div>
    );
  }

  if (message.type === 'contact') {
    return (
      <div className="chat-bubble__contact">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <span>{message.fileName ?? 'Contact'}</span>
      </div>
    );
  }

  if (message.type === 'location') {
    return (
      <div className="chat-bubble__location">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <span>Location shared</span>
        <a href={message.content} target="_blank" rel="noopener noreferrer" className="chat-bubble__location-link">View on Map</a>
      </div>
    );
  }

  return null;
});
MediaContent.displayName = 'MediaContent';

// =============================================
// Chat Bubble
// =============================================
interface ChatBubbleInnerProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
  isGroup: boolean;
  searchQuery?: string;
  isHighlighted?: boolean;
  onMediaClick?: (mediaKey: string, type: string, url?: string | null) => void;
  senderColor?: string;
}

export const ChatBubble: React.FC<ChatBubbleInnerProps> = React.memo(({
  message,
  isOwn,
  showSender,
  isGroup,
  searchQuery,
  isHighlighted,
  onMediaClick,
  senderColor,
}) => {
  const isSystem = message.type === 'system';
  const isDeleted = message.type === 'deleted';
  const isMedia = ['image', 'video', 'sticker', 'gif', 'document', 'contact', 'location'].includes(message.type);
  const isAudio = message.type === 'audio';
  const hasText = message.type === 'text' || isDeleted;

  // Extract caption: text that accompanies a media attachment
  // WhatsApp stores captions as continuation lines after the attachment reference
  const caption = isMedia ? (() => {
    const attachmentPattern = /<attached:\s*.+?>|.+?\s*\(file attached\)/i;
    const stripped = message.content.replace(attachmentPattern, '').trim();
    // Also strip "image omitted" style placeholders
    const omittedPattern = /^(image|video|audio|sticker|gif|document|voice message)\s+omitted$/i;
    if (omittedPattern.test(stripped) || !stripped) return null;
    return stripped;
  })() : null;

  if (isSystem) {
    return (
      <div className="chat-bubble__system-wrapper">
        <div className="chat-bubble__system" data-clarity-mask="True">{message.content}</div>
      </div>
    );
  }

  return (
    <div className={`chat-bubble__wrapper${isOwn ? ' chat-bubble__wrapper--own' : ''}${isHighlighted ? ' chat-bubble__wrapper--highlighted' : ''}`}>
      {/* Avatar for group chats */}
      {isGroup && !isOwn && (
        <div
          className="chat-bubble__avatar"
          style={{ background: senderColor ?? getSenderColor(message.sender) }}
          aria-hidden="true"
        >
          {message.sender.charAt(0).toUpperCase()}
        </div>
      )}

      <div 
        className={`chat-bubble${isOwn ? ' chat-bubble--own' : ' chat-bubble--other'}${isDeleted ? ' chat-bubble--deleted' : ''}${isMedia && !hasText && !caption ? ' chat-bubble--media-only' : ''}`}
        data-clarity-mask="True"
      >
        {/* Sender name in group */}
        {showSender && (
          <div className="chat-bubble__sender" style={{ color: senderColor ?? getSenderColor(message.sender) }}>
            {message.sender}
          </div>
        )}

        {/* Content */}
        {isMedia || isAudio ? (
          <>
            <MediaContent message={message} onMediaClick={onMediaClick} />
            {caption && (
              <div className="chat-bubble__text chat-bubble__caption">
                {searchQuery ? highlightText(caption, searchQuery) : caption}
              </div>
            )}
          </>
        ) : (
          <div className={`chat-bubble__text${isDeleted ? ' chat-bubble__text--deleted' : ''}`}>
            {isDeleted ? (
              <span className="chat-bubble__deleted-text">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 4, opacity: 0.7 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                {isOwn ? 'You deleted this message' : 'This message was deleted'}
              </span>
            ) : (
              searchQuery ? highlightText(message.content, searchQuery) : message.content
            )}
          </div>
        )}

        {/* Timestamp & ticks */}
        <div className="chat-bubble__footer">
          <span className="chat-bubble__time">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="chat-bubble__ticks" aria-label="Delivered" title="Delivered">
              <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                <path d="M11.071.653a.45.45 0 0 0-.63 0L4.5 6.593 1.559 3.652a.45.45 0 0 0-.63.63l3.256 3.256a.45.45 0 0 0 .63 0l6.256-6.256a.45.45 0 0 0 0-.629zM15.441.653a.45.45 0 0 0-.63 0L8.87 6.593 8.2 5.923a.45.45 0 1 0-.636.636l.985.985a.45.45 0 0 0 .636 0l6.256-6.256a.45.45 0 0 0 0-.635z" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ChatBubble.displayName = 'ChatBubble';

export { getSenderColor };
