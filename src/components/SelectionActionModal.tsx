import React, { useState, useRef, useEffect } from 'react';
import './SelectionActionModal.css';

// =============================================
// Types
// =============================================
type ActionType = 'bookmark' | 'note' | 'delete';

interface SelectionActionModalProps {
  selectedCount: number;
  initialAction?: ActionType;
  onClose: () => void;
  onBookmark: (name: string) => void;
  onNote: (name: string, note: string) => void;
  onDelete: () => void;
}

// =============================================
// Component
// =============================================
export const SelectionActionModal: React.FC<SelectionActionModalProps> = ({
  selectedCount,
  initialAction,
  onClose,
  onBookmark,
  onNote,
  onDelete,
}) => {
  const [step, setStep] = useState<'pick' | 'configure'>(
    initialAction && initialAction !== 'delete' ? 'configure' : 'pick'
  );
  const [action, setAction] = useState<ActionType | null>(initialAction ?? null);
  const [groupName, setGroupName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus name field when we move to configure step
  useEffect(() => {
    if (step === 'configure') {
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [step]);

  // Escape to go back or close
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (step === 'configure' && !initialAction) setStep('pick');
        else onClose();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [step, initialAction, onClose]);

  const pickAction = (a: ActionType) => {
    if (a === 'delete') { setAction('delete'); return; }
    setAction(a);
    setGroupName('');
    setNoteText('');
    setStep('configure');
  };

  const handleConfirm = () => {
    if (!action) return;
    const name = groupName.trim();
    if (!name) return; // Cannot create untitled groups
    if (action === 'note' && !noteText.trim()) return;
    if (action === 'bookmark') onBookmark(name);
    else if (action === 'note') onNote(name, noteText.trim());
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const actionConfig = {
    bookmark: {
      label: 'Bookmark as Group',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
      color: '#818cf8',
      colorBg: 'rgba(129,140,248,0.1)',
    },
    note: {
      label: 'Add Group Note',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      color: 'var(--brand-primary)',
      colorBg: 'rgba(0,168,132,0.1)',
    },
  } as const;

  const currentConfig = action && action !== 'delete' ? actionConfig[action] : null;

  return (
    <div
      className="sam-backdrop"
      ref={backdropRef}
      onMouseDown={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="sam-modal" role="dialog" aria-modal="true" aria-label="Message group actions">

        {/* ── ACTION: Delete confirmation dialog ── */}
        {action === 'delete' && (
          <div className="sam-delete-view">
            <div className="sam-header">
              <div className="sam-header__icon sam-header__icon--delete">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <div className="sam-header__text">
                <span className="sam-header__count">Delete Selected Messages</span>
                <span className="sam-header__sub">{selectedCount} message{selectedCount !== 1 ? 's' : ''} selected</span>
              </div>
              <button className="sam-close" onClick={onClose} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="sam-delete-body">
              <p className="sam-delete-msg">
                Are you sure you want to remove all actions from these <strong>{selectedCount} selected message{selectedCount !== 1 ? 's' : ''}</strong>?
              </p>
              <div className="sam-delete-warning">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Any bookmarks, group notes, or saved references for these messages will be cleared.</span>
              </div>
            </div>

            <div className="sam-delete-footer">
              <button className="sam-btn sam-btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="sam-btn sam-btn--delete-confirm" onClick={handleDelete}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Pick action (fallback if opened without initialAction) ── */}
        {action !== 'delete' && step === 'pick' && (
          <>
            <div className="sam-header">
              <div className="sam-header__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div className="sam-header__text">
                <span className="sam-header__count">{selectedCount} message{selectedCount !== 1 ? 's' : ''} selected</span>
                <span className="sam-header__sub">Choose an action for this selection</span>
              </div>
              <button className="sam-close" onClick={onClose} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="sam-actions">
              {/* Bookmark */}
              <button className="sam-action-btn sam-action-btn--bookmark" onClick={() => pickAction('bookmark')}>
                <span className="sam-action-btn__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="sam-action-btn__label">Bookmark as Group</span>
                <svg className="sam-action-btn__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Note */}
              <button className="sam-action-btn sam-action-btn--note" onClick={() => pickAction('note')}>
                <span className="sam-action-btn__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </span>
                <span className="sam-action-btn__label">Add Group Note</span>
                <svg className="sam-action-btn__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Divider */}
              <div className="sam-divider" />

              {/* Delete */}
              {!confirmDelete ? (
                <button className="sam-action-btn sam-action-btn--delete" onClick={() => setConfirmDelete(true)}>
                  <span className="sam-action-btn__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </span>
                  <span className="sam-action-btn__label">Delete Selected</span>
                </button>
              ) : (
                <div className="sam-confirm-delete">
                  <span>Remove all actions from {selectedCount} message{selectedCount !== 1 ? 's' : ''}?</span>
                  <div className="sam-confirm-delete__btns">
                    <button className="sam-confirm-delete__cancel" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    <button className="sam-confirm-delete__confirm" onClick={handleDelete}>Yes, Delete</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STEP 2: Configure name / note ── */}
        {action !== 'delete' && step === 'configure' && currentConfig && (
          <>
            <div className="sam-header">
              {!initialAction && (
                <button className="sam-back" onClick={() => setStep('pick')} aria-label="Back">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                </button>
              )}
              <div className="sam-header__icon" style={{ color: currentConfig.color, background: currentConfig.colorBg }}>
                {currentConfig.icon}
              </div>
              <div className="sam-header__text">
                <span className="sam-header__count">{currentConfig.label}</span>
                <span className="sam-header__sub">{selectedCount} message{selectedCount !== 1 ? 's' : ''}</span>
              </div>
              <button className="sam-close" onClick={onClose} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="sam-configure">
              <label className="sam-label" htmlFor="sam-group-name">
                Group Title <span className="sam-label__required">*</span>
              </label>
              <input
                ref={nameRef}
                id="sam-group-name"
                className="sam-input"
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Important updates, Project notes…"
                maxLength={60}
                required
                onKeyDown={e => {
                  if (e.key === 'Enter' && groupName.trim() && (action !== 'note' || noteText.trim())) {
                    handleConfirm();
                  }
                }}
              />
              {!groupName.trim() && (
                <div className="sam-field-hint">A group title is required to create this group.</div>
              )}

              {action === 'note' && (
                <>
                  <label className="sam-label" htmlFor="sam-group-note" style={{ marginTop: 14 }}>
                    Group note <span className="sam-label__required">*</span>
                  </label>
                  <textarea
                    id="sam-group-note"
                    className="sam-textarea"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Enter a note for all selected messages…"
                    rows={3}
                    maxLength={500}
                    autoFocus={false}
                  />
                  <div className="sam-char-count">{noteText.length}/500</div>
                </>
              )}

              <div className="sam-configure__footer">
                <button
                  className="sam-btn sam-btn--cancel"
                  onClick={!initialAction ? () => setStep('pick') : onClose}
                >
                  Cancel
                </button>
                <button
                  className="sam-btn sam-btn--confirm"
                  style={{ background: currentConfig.color }}
                  onClick={handleConfirm}
                  disabled={!groupName.trim() || (action === 'note' && !noteText.trim())}
                >
                  {currentConfig.label}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
