import React, { useEffect, useRef, useState, useCallback } from 'react';
import './MessageContextMenu.css';

// =============================================
// Types
// =============================================
export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface MessageContextMenuProps {
  position: ContextMenuPosition;
  messageId: string;
  isBookmarked: boolean;
  hasNote: boolean;
  noteText: string;
  onClose: () => void;
  onCopy?: (messageId: string) => void;
  messageContent?: string;
  onSelect: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onBookmark: (messageId: string) => void;
  onAddNote: (messageId: string, note: string) => void;
}

// Estimated dimensions — used to pre-calculate position before first paint
const MENU_W = 248;
const MENU_H_MAIN = 270; // main menu height estimate (5 items)
const MENU_H_NOTE = 220; // note input height estimate
const MARGIN = 10;

function calcPos(x: number, y: number, h: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = x + MENU_W > vw - MARGIN ? x - MENU_W : x;
  // Flip upward if menu would be cropped at the bottom
  const cy = y + h > vh - MARGIN ? Math.max(MARGIN, y - h) : y;
  return { x: Math.max(MARGIN, cx), y: Math.max(MARGIN, cy) };
}

// =============================================
// Component
// =============================================
export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  position,
  messageId,
  isBookmarked,
  hasNote,
  noteText,
  messageContent,
  onClose,
  onCopy,
  onSelect,
  onDelete,
  onBookmark,
  onAddNote,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteValue, setNoteValue] = useState(noteText);

  // Pre-calculate position immediately — avoids the "render then jump" flash
  const pos = calcPos(
    position.x,
    position.y,
    showNoteInput ? MENU_H_NOTE : MENU_H_MAIN
  );

  // Fine-tune after mount using actual measured rect
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let { left, top } = menuRef.current.style as unknown as { left: string; top: string };
    let lNum = parseFloat(left);
    let tNum = parseFloat(top);
    if (lNum + rect.width > vw - MARGIN) lNum = vw - rect.width - MARGIN;
    if (tNum + rect.height > vh - MARGIN) tNum = position.y - rect.height;
    if (tNum < MARGIN) tNum = MARGIN;
    if (lNum < MARGIN) lNum = MARGIN;
    menuRef.current.style.left = `${lNum}px`;
    menuRef.current.style.top = `${tNum}px`;
  }, [position, showNoteInput]);

  // Close on outside click / Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleSaveNote = useCallback(() => {
    onAddNote(messageId, noteValue);
    setShowNoteInput(false);
    onClose();
  }, [messageId, noteValue, onAddNote, onClose]);

  const handleCopy = useCallback(() => {
    if (onCopy) {
      onCopy(messageId);
    } else if (messageContent) {
      navigator.clipboard.writeText(messageContent).catch(console.error);
    }
    onClose();
  }, [messageId, onCopy, messageContent, onClose]);

  const menuItems = [
    {
      id: 'copy',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      ),
      label: 'Copy to Clipboard',
      action: handleCopy,
      colorClass: 'context-menu__item--copy',
    },
    {
      id: 'select',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      label: 'Select Message',
      action: () => { onSelect(messageId); onClose(); },
    },
    {
      id: 'bookmark',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
      label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
      action: () => { onBookmark(messageId); onClose(); },
      active: isBookmarked,
      colorClass: 'context-menu__item--bookmark',
    },
    {
      id: 'note',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      label: hasNote ? 'Edit Note' : 'Add Note',
      action: () => { setNoteValue(noteText); setShowNoteInput(true); },
      active: hasNote,
      colorClass: 'context-menu__item--note',
    },
    {
      id: 'delete',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      ),
      label: 'Delete from View',
      action: () => { onDelete(messageId); onClose(); },
      danger: true,
    },
  ];

  return (
    <div className="context-menu-backdrop" onContextMenu={e => e.preventDefault()}>
      <div
        ref={menuRef}
        className="context-menu"
        style={{ left: pos.x, top: pos.y }}
        role="menu"
        aria-label="Message actions"
      >
        {!showNoteInput ? (
          <>
            <div className="context-menu__header">
              <span>Message Actions</span>
            </div>
            <div className="context-menu__items">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  className={[
                    'context-menu__item',
                    item.danger ? 'context-menu__item--danger' : '',
                    item.active ? (item.colorClass ?? '') : '',
                  ].filter(Boolean).join(' ')}
                  onClick={item.action}
                  role="menuitem"
                  id={`ctx-${item.id}-${messageId}`}
                >
                  <span className="context-menu__item-icon">{item.icon}</span>
                  <span className="context-menu__item-label">{item.label}</span>
                  {item.active && <span className="context-menu__item-dot" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="context-menu__note-section">
            <div className="context-menu__note-header">
              <button
                className="context-menu__note-back"
                onClick={() => setShowNoteInput(false)}
                aria-label="Back"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
            </div>
            <textarea
              className="context-menu__note-textarea"
              value={noteValue}
              onChange={e => setNoteValue(e.target.value)}
              placeholder="Type your note here…"
              autoFocus
              rows={3}
              maxLength={500}
              aria-label="Note text"
            />
            <div className="context-menu__note-actions">
              {hasNote && (
                <button
                  className="context-menu__note-btn context-menu__note-btn--remove"
                  onClick={() => { onAddNote(messageId, ''); setShowNoteInput(false); onClose(); }}
                >
                  Remove
                </button>
              )}
              <button
                className="context-menu__note-btn context-menu__note-btn--cancel"
                onClick={() => setShowNoteInput(false)}
              >
                Cancel
              </button>
              <button
                className="context-menu__note-btn context-menu__note-btn--save"
                onClick={handleSaveNote}
                disabled={!noteValue.trim()}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
