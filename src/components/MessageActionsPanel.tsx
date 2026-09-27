import React, { useState, useCallback } from 'react';
import type { ChatMessage } from '../lib/chatParser';
import type { MessageNote, MessageActionsHook } from '../hooks/useMessageActions';
import { formatTime } from '../lib/mediaUtils';
import { formatDate } from '../lib/mediaUtils';
import './MessageActionsPanel.css';

// =============================================
// Types
// =============================================
type PanelTab = 'bookmarked' | 'noted';

interface MessageActionsQuickViewProps {
  tab: PanelTab;
  messages: ChatMessage[];
  notes: Record<string, MessageNote>;
  actions: MessageActionsHook;
  onScrollToMessage: (messageId: string) => void;
  onClose: () => void;
}

// =============================================
// Display Group Interface
// =============================================
interface DisplayGroup {
  id: string;
  name: string;
  messageIds: string[];
  actionType: PanelTab;
  note?: string;
  createdAt: string;
  isAutoDetected?: boolean;
}

// =============================================
// Group Card in Panel (Collapsed by default, expandable)
// =============================================
const PanelGroupCard: React.FC<{
  group: DisplayGroup;
  tab: PanelTab;
  messageMap: Map<string, ChatMessage>;
  actions: MessageActionsHook;
  onScrollTo: (id: string) => void;
}> = ({ group, tab, messageMap, actions, onScrollTo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const groupMsgs = React.useMemo(() => {
    return group.messageIds
      .map(id => messageMap.get(id))
      .filter(Boolean) as ChatMessage[];
  }, [group.messageIds, messageMap]);

  if (groupMsgs.length === 0) return null;

  // Senders list summary
  const senders = Array.from(new Set(groupMsgs.map(m => m.sender)));
  const sendersSummary = senders.length > 2
    ? `${senders.slice(0, 2).join(', ')} +${senders.length - 2}`
    : senders.join(', ');

  const typeIcons: Record<string, string> = {
    image: '🖼️', video: '🎥', audio: '🎵', document: '📄',
    sticker: '🎭', gif: '🎞️', contact: '👤', location: '📍',
    deleted: '🚫', system: 'ℹ️',
  };

  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setTimeout(() => {
      if (group.isAutoDetected) {
        group.messageIds.forEach(id => actions.removeNote(id));
      } else {
        actions.deleteGroup(group.id, true);
      }
    }, 220);
  };

  return (
    <div
      className={[
        'map-group-card',
        `map-group-card--${tab}`,
        isExpanded ? 'map-group-card--expanded' : '',
        isRemoving ? 'map-card--removing' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* ── Group Header (always visible & clickable) ── */}
      <div
        className="map-group-card__header"
        onClick={() => setIsExpanded(prev => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${group.name}, ${groupMsgs.length} messages. Click to ${isExpanded ? 'collapse' : 'expand'}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(p => !p);
          }
        }}
      >
        <div className="map-group-card__header-top">
          {/* Group Icon Badge */}
          <div className="map-group-card__icon-badge">
            {tab === 'bookmarked' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            )}
          </div>

          {/* Group Info (Name & Meta) */}
          <div className="map-group-card__info">
            <div className="map-group-card__title-row">
              <span className="map-group-card__title">
                {group.name || (tab === 'bookmarked' ? 'Bookmarked Group' : 'Group Note')}
              </span>
              <span className="map-group-card__count-pill">{groupMsgs.length} messages</span>
            </div>
            <div className="map-group-card__meta">
              <span className="map-group-card__senders">{sendersSummary}</span>
              {group.createdAt && (
                <>
                  <span className="map-group-card__dot">·</span>
                  <span className="map-group-card__date">{formatDate(new Date(group.createdAt))}</span>
                </>
              )}
            </div>
          </div>

          {/* Header Controls (Delete & Chevron) */}
          <div className="map-group-card__controls">
            {!showConfirm ? (
              <button
                className="map-group-card__delete-btn"
                onClick={e => {
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
                aria-label="Delete group"
                title="Remove group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : (
              <div className="map-group-card__confirm-btns" onClick={e => e.stopPropagation()}>
                <button
                  className="map-group-card__confirm-btn map-group-card__confirm-btn--yes"
                  onClick={handleDeleteGroup}
                  title="Confirm delete"
                >
                  Delete
                </button>
                <button
                  className="map-group-card__confirm-btn map-group-card__confirm-btn--cancel"
                  onClick={() => setShowConfirm(false)}
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
            )}
            <span
              className={`map-group-card__chevron ${isExpanded ? 'map-group-card__chevron--expanded' : ''}`}
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* ── Note Callout (for Note Groups) ── */}
        {tab === 'noted' && group.note && (
          <div className="map-group-card__note-banner">
            <div className="map-group-card__note-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Note</span>
            </div>
            <span className="map-group-card__note-text">{group.note}</span>
          </div>
        )}

      </div>

      {/* ── Accordion Body (Messages list) ── */}
      {isExpanded && (
        <div className="map-group-card__body">
          <div className="map-group-card__list-header">
            <span>MESSAGES IN THIS GROUP</span>
            <span className="map-group-card__list-count">{groupMsgs.length}</span>
          </div>

          <div className="map-group-card__items">
            {groupMsgs.map((msg, idx) => {
              const preview = msg.content.length > 130
                ? msg.content.slice(0, 130) + '…'
                : msg.content;
              const icon = typeIcons[msg.type] ?? null;

              return (
                <div key={msg.id} className="map-group-item">
                  <div className="map-group-item__meta">
                    <span className="map-group-item__idx">#{idx + 1}</span>
                    <span className="map-group-item__sender">{msg.sender}</span>
                    <span className="map-group-item__time">
                      {formatDate(msg.timestamp)} · {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  <div className="map-group-item__content" onClick={() => onScrollTo(msg.id)}>
                    {icon && <span className="map-group-item__icon">{icon}</span>}
                    <p className="map-group-item__text">{preview || <em>Media message</em>}</p>
                  </div>

                  <div className="map-group-item__footer">
                    <button
                      className="map-group-item__jump-btn"
                      onClick={() => onScrollTo(msg.id)}
                      aria-label={`Jump to message by ${msg.sender}`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      Jump to message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="map-group-card__footer">
            <button
              className="map-group-card__collapse-btn"
              onClick={() => setIsExpanded(false)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Collapse group
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================
// Single Message Card in Panel
// =============================================
const PanelMessageCard: React.FC<{
  message: ChatMessage;
  note?: MessageNote;
  tab: PanelTab;
  actions: MessageActionsHook;
  onScrollTo: (id: string) => void;
}> = ({ message, note, tab, actions, onScrollTo }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const preview = message.content.length > 140
    ? message.content.slice(0, 140) + '…'
    : message.content;

  const typeIcons: Record<string, string> = {
    image: '🖼️', video: '🎥', audio: '🎵', document: '📄',
    sticker: '🎭', gif: '🎞️', contact: '👤', location: '📍',
    deleted: '🚫', system: 'ℹ️',
  };

  const icon = typeIcons[message.type] ?? null;

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      if (tab === 'bookmarked') actions.removeBookmark(message.id);
      else if (tab === 'noted') actions.removeNote(message.id);
    }, 220);
  }, [tab, message.id, actions]);

  return (
    <div className={`map-card${isRemoving ? ' map-card--removing' : ''}`}>
      <div className="map-card__meta">
        <span className="map-card__sender">{message.sender}</span>
        <span className="map-card__time">
          {formatDate(message.timestamp)} · {formatTime(message.timestamp)}
        </span>
      </div>

      <div className="map-card__content" onClick={() => { onScrollTo(message.id); }}>
        {icon && <span className="map-card__type-icon" aria-label={message.type}>{icon}</span>}
        <p className="map-card__text">{preview || <em>Media message</em>}</p>
      </div>

      {tab === 'noted' && note && (
        <div className="map-card__note">
          <div className="map-card__note-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Note</span>
          </div>
          <span className="map-card__note-text">{note.note}</span>
        </div>
      )}

      <div className="map-card__actions">
        <button
          className="map-card__jump-btn"
          onClick={() => onScrollTo(message.id)}
          aria-label="Jump to message"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Jump to message
        </button>
        <button
          className="map-card__remove-btn"
          onClick={handleRemove}
          aria-label="Remove"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// =============================================
// Tab Button
// =============================================
const TabBtn: React.FC<{
  active: boolean;
  count: number;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  id: string;
}> = ({ active, count, icon, label, onClick, id }) => (
  <button
    id={id}
    className={`map-tab${active ? ' map-tab--active' : ''}`}
    onClick={onClick}
    aria-label={`${label} (${count})`}
  >
    <span className="map-tab__icon">{icon}</span>
    <span className="map-tab__label">{label}</span>
    {count > 0 && (
      <span className="map-tab__badge">{count > 99 ? '99+' : count}</span>
    )}
  </button>
);

// =============================================
// Main Panel
// =============================================
export const MessageActionsPanel: React.FC<MessageActionsQuickViewProps> = ({
  tab: initialTab,
  messages,
  notes,
  actions,
  onScrollToMessage,
  onClose,
}) => {
  const [tab, setTab] = useState<PanelTab>(initialTab);

  // Fast message map
  const messageMap = React.useMemo(() => {
    const map = new Map<string, ChatMessage>();
    messages.forEach(m => map.set(m.id, m));
    return map;
  }, [messages]);

  // Compute Display Groups and Standalone Messages for the active tab
  const { displayGroups, standaloneMessages } = React.useMemo(() => {
    // 1. Explicit groups from actions.groups for this tab
    const explicitGroups: DisplayGroup[] = (actions.groups || [])
      .filter(g => g.actionType === tab)
      .map(g => ({
        id: g.id,
        name: g.name,
        messageIds: g.messageIds,
        actionType: tab,
        note: g.note,
        createdAt: g.createdAt,
      }));

    const claimedMessageIds = new Set<string>();
    explicitGroups.forEach(g => {
      g.messageIds.forEach(id => claimedMessageIds.add(id));
    });

    const autoGroups: DisplayGroup[] = [];

    // 2. For 'noted', detect clusters of notes that share identical note text
    // (seamlessly handles any notes created as group before or during testing)
    if (tab === 'noted') {
      const unclaimedNotedMsgs = messages.filter(
        m => actions.hasNote(m.id) && !claimedMessageIds.has(m.id)
      );

      const noteBuckets = new Map<string, ChatMessage[]>();
      unclaimedNotedMsgs.forEach(m => {
        const text = notes[m.id]?.note?.trim() || '';
        if (!text) return;
        if (!noteBuckets.has(text)) noteBuckets.set(text, []);
        noteBuckets.get(text)!.push(m);
      });

      noteBuckets.forEach((clusterMsgs, noteText) => {
        if (clusterMsgs.length >= 2) {
          const autoGroup: DisplayGroup = {
            id: `auto-group-${clusterMsgs[0].id}`,
            name: 'Group Note',
            messageIds: clusterMsgs.map(m => m.id),
            actionType: 'noted',
            note: noteText,
            createdAt: notes[clusterMsgs[0].id]?.createdAt || clusterMsgs[0].timestamp.toISOString(),
            isAutoDetected: true,
          };
          autoGroups.push(autoGroup);
          clusterMsgs.forEach(m => claimedMessageIds.add(m.id));
        }
      });
    }

    const allDisplayGroups = [...explicitGroups, ...autoGroups]
      .filter(g => g.messageIds.some(id => messageMap.has(id)));

    // Standalone messages are those matching the tab action but not in any group
    let standalone: ChatMessage[] = [];
    if (tab === 'bookmarked') {
      standalone = messages.filter(m => actions.isBookmarked(m.id) && !claimedMessageIds.has(m.id));
    } else {
      standalone = messages.filter(m => actions.hasNote(m.id) && !claimedMessageIds.has(m.id));
    }

    return {
      displayGroups: allDisplayGroups,
      standaloneMessages: standalone,
    };
  }, [tab, messages, notes, actions, messageMap]);

  const totalItemsCount = displayGroups.length + standaloneMessages.length;

  return (
    <div className="map-panel" role="dialog" aria-modal="true" aria-label="Message actions panel">
      {/* Panel Header */}
      <div className="map-panel__header">
        <div className="map-panel__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Saved Messages
        </div>
        <button className="map-panel__close" onClick={onClose} aria-label="Close panel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="map-panel__tabs" role="tablist">
        <TabBtn
          id="map-tab-bookmarked"
          active={tab === 'bookmarked'}
          count={actions.bookmarkedCount}
          onClick={() => setTab('bookmarked')}
          label="Bookmarks"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill={tab === 'bookmarked' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <TabBtn
          id="map-tab-noted"
          active={tab === 'noted'}
          count={actions.notesCount}
          onClick={() => setTab('noted')}
          label="Notes"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }
        />
      </div>

      {/* Content */}
      <div className="map-panel__content">
        {totalItemsCount === 0 ? (
          <div className="map-panel__empty">
            <div className="map-panel__empty-icon">
              {tab === 'bookmarked' && (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
              {tab === 'noted' && (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              )}
            </div>
            <p className="map-panel__empty-text">
              {tab === 'bookmarked' && 'No bookmarks yet'}
              {tab === 'noted' && 'No notes yet'}
            </p>
            <p className="map-panel__empty-sub">
              {tab === 'bookmarked' && 'Select messages or right-click to bookmark'}
              {tab === 'noted' && 'Select messages or right-click to add a note'}
            </p>
          </div>
        ) : (
          <div className="map-panel__list">
            {/* ── Group Cards ── */}
            {displayGroups.length > 0 && (
              <div className="map-section">
                {standaloneMessages.length > 0 && (
                  <div className="map-section__title">
                    <span>Grouped {tab === 'bookmarked' ? 'Bookmarks' : 'Notes'}</span>
                    <span className="map-section__badge">{displayGroups.length}</span>
                  </div>
                )}
                {displayGroups.map(group => (
                  <PanelGroupCard
                    key={group.id}
                    group={group}
                    tab={tab}
                    messageMap={messageMap}
                    actions={actions}
                    onScrollTo={id => { onScrollToMessage(id); onClose(); }}
                  />
                ))}
              </div>
            )}

            {/* ── Standalone Message Cards ── */}
            {standaloneMessages.length > 0 && (
              <div className="map-section">
                {displayGroups.length > 0 && (
                  <div className="map-section__title">
                    <span>Individual {tab === 'bookmarked' ? 'Bookmarks' : 'Notes'}</span>
                    <span className="map-section__badge">{standaloneMessages.length}</span>
                  </div>
                )}
                {standaloneMessages.map(msg => (
                  <PanelMessageCard
                    key={msg.id}
                    message={msg}
                    note={notes[msg.id]}
                    tab={tab}
                    actions={actions}
                    onScrollTo={id => { onScrollToMessage(id); onClose(); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
