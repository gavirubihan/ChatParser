import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatSession } from '../lib/storage';
import { formatFileSize, formatDateShort } from '../lib/mediaUtils';
import { ThemeToggle } from './ThemeToggle';
import { getSenderColor } from '../lib/colorUtils';
import { PrivacyModeToggle } from './PrivacyModeToggle';
import './Sidebar.css';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onDelete: (id: string) => void;
  onUploadClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onDelete,
  onUploadClick,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sessions.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    navigate(`/chat/${id}`);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const confirmDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
    setConfirmDelete(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar__overlay animate-fade-in" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Chat sessions">
        {/* Header */}
        <div className="sidebar__header">
          <div className="sidebar__header-top">
            <div className="sidebar__logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#00a884" />
                <path d="M16 6C10.477 6 6 10.477 6 16c0 1.854.506 3.591 1.39 5.085L6 26l5.09-1.33A9.954 9.954 0 0 0 16 26c5.523 0 10-4.477 10-10S21.523 6 16 6zm0 18a7.975 7.975 0 0 1-4.08-1.12l-.29-.18-3.02.79.81-2.94-.19-.3A7.954 7.954 0 0 1 8 16c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" fill="white" />
              </svg>
              <span className="sidebar__logo-text">ChatVault</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Search box */}
          <div className="sidebar__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="sidebar__search-input"
              aria-label="Search chats"
            />
          </div>
        </div>

        {/* Session List */}
        <div className="sidebar__sessions" role="list">
          {filtered.length === 0 && !searchQuery && (
            <div className="sidebar__empty">
              <div className="sidebar__empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <p>No chats yet</p>
              <p className="sidebar__empty-sub">Upload a WhatsApp export to get started</p>
            </div>
          )}

          {filtered.length === 0 && searchQuery && (
            <div className="sidebar__empty">
              <p>No chats match "{searchQuery}"</p>
            </div>
          )}

          {filtered.map(session => (
            <div
              key={session.id}
              className={`sidebar__session ${activeSessionId === session.id ? 'sidebar__session--active' : ''}`}
              onClick={() => handleSelect(session.id)}
              role="listitem"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelect(session.id)}
              aria-current={activeSessionId === session.id ? 'page' : undefined}
            >
              {/* Avatar */}
              <div
                className="sidebar__session-avatar"
                style={{ background: `linear-gradient(135deg, ${getSenderColor(session.name)}, ${getSenderColor(session.name + '1')})` }}
                aria-hidden="true"
              >
                {session.isGroup ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ) : (
                  session.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="sidebar__session-info">
                <div className="sidebar__session-row">
                  <span className="sidebar__session-name">{session.name}</span>
                  <span className="sidebar__session-date">{formatDateShort(new Date(session.startDate))}</span>
                </div>
                <div className="sidebar__session-row">
                  <span className="sidebar__session-meta">
                    {session.messageCount.toLocaleString()} messages
                    {session.isGroup && ` · ${session.participants.length} members`}
                  </span>
                  <span className="sidebar__session-size">{formatFileSize(session.size)}</span>
                </div>
              </div>

              {/* Delete */}
              {confirmDelete === session.id ? (
                <div className="sidebar__session-confirm" onClick={e => e.stopPropagation()}>
                  <span className="sidebar__confirm-text">Delete?</span>
                  <button
                    className="sidebar__confirm-yes"
                    onClick={e => confirmDeleteSession(e, session.id)}
                    aria-label="Confirm delete"
                  >
                    Yes
                  </button>
                  <button
                    className="sidebar__confirm-no"
                    onClick={cancelDelete}
                    aria-label="Cancel delete"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  className="sidebar__session-delete"
                  onClick={e => handleDelete(e, session.id)}
                  aria-label={`Delete ${session.name}`}
                  title="Delete chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer: Privacy toggle + Upload */}
        <div className="sidebar__footer">
          <PrivacyModeToggle />
          <button className="sidebar__upload-btn" onClick={onUploadClick} id="sidebar-upload-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload New Chat
          </button>
        </div>
      </aside>
    </>
  );
};
