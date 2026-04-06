import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatList } from '../components/ChatList';
import type { ChatListHandle } from '../components/ChatList';
import { Sidebar } from '../components/Sidebar';
import { SearchPanel } from '../components/SearchPanel';
import { MediaViewer } from '../components/MediaViewer';
import { UploadZone } from '../components/UploadZone';
import { ThemeToggle } from '../components/ThemeToggle';
import { useMessages, useAllSessions } from '../hooks/useChat';
import { useSearch } from '../hooks/useSearch';
import type { ProcessResult } from '../lib/zipHandler';

import { getSenderColor } from '../lib/colorUtils';
import './ChatViewer.css';

export const ChatViewer: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // Data
  const { sessions, loading: sessionsLoading, reload: reloadSessions, removeSession } = useAllSessions();
  const { messages, loading: messagesLoading } = useMessages(sessionId ?? null);
  const currentSession = sessions.find(s => s.id === sessionId);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ mediaKey: string; type: string, url?: string | null } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);


  // Refs
  const chatListRef = useRef<ChatListHandle>(null);

  // Search
  const {
    search, setSearch, results, isFiltered,
    isOpen: _searchIsOpen, setIsOpen: _setSearchIsOpen,
    currentIndex, setCurrentIndex: _setCurrentIndex,
    clearSearch, nextResult, prevResult,
  } = useSearch(messages);

  const displayMessages = isFiltered ? results : messages;
  const highlightedMsg = isFiltered && results.length > 0 ? results[currentIndex] : undefined;

  // Scroll to highlighted message when search navigation changes
  useEffect(() => {
    if (highlightedMsg) {
      chatListRef.current?.scrollToMessage(highlightedMsg.id);
    }
  }, [highlightedMsg?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleUploadSuccess = useCallback(async (result: ProcessResult) => {
    await reloadSessions();
    setShowUploadModal(false);
    navigate(`/chat/${result.sessionId}`);
  }, [reloadSessions, navigate]);

  const handleMediaClick = useCallback((mediaKey: string, type: string, url?: string | null) => {
    setMediaViewer({ mediaKey, type, url });
  }, []);

  const scrollToBottom = useCallback(() => {
    chatListRef.current?.scrollToBottom();
  }, []);

  if (sessionsLoading) {
    return (
      <div className="chat-viewer__loading-screen">
        <div className="chat-viewer__loading-spinner" />
        <p>Loading your chats…</p>
      </div>
    );
  }

  return (
    <div className="chat-viewer">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={sessionId}
        onDelete={removeSession}
        onUploadClick={() => setShowUploadModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main panel */}
      <main className="chat-viewer__main" aria-label="Chat messages">
        {!sessionId || !currentSession ? (
          /* No chat selected */
          <div className="chat-viewer__welcome">
            <div className="chat-viewer__welcome-content">
              <div className="chat-viewer__welcome-icon" aria-hidden="true">
                <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="var(--brand-primary)" opacity="0.15" />
                  <path d="M16 6C10.477 6 6 10.477 6 16c0 1.854.506 3.591 1.39 5.085L6 26l5.09-1.33A9.954 9.954 0 0 0 16 26c5.523 0 10-4.477 10-10S21.523 6 16 6z" fill="var(--brand-primary)" opacity="0.5" />
                </svg>
              </div>
              <h1 className="chat-viewer__welcome-title">ChatVault</h1>
              <p className="chat-viewer__welcome-sub">
                {sessions.length === 0
                  ? 'Upload a WhatsApp chat export to get started.'
                  : 'Select a chat from the sidebar to start browsing.'}
              </p>
              <div className="chat-viewer__welcome-actions">
                <button
                  className="chat-viewer__welcome-open-sidebar"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M9 3v18" />
                  </svg>
                  Open Sidebar
                </button>
                <button
                  className="chat-viewer__welcome-upload"
                  onClick={() => setShowUploadModal(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Chat
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="chat-viewer__header" role="banner">
              {/* Mobile menu */}
              <button
                className="chat-viewer__menu-btn"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open chat list"
                id="open-sidebar-btn"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Chat info */}
              <div className="chat-viewer__header-info">
                <div
                  className="chat-viewer__header-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${getSenderColor(currentSession.name)}, ${getSenderColor(currentSession.name + 'x')})`,
                  }}
                  aria-hidden="true"
                >
                  {currentSession.isGroup ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ) : (
                    currentSession.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="chat-viewer__header-text">
                  <h1 className="chat-viewer__header-name">{currentSession.name}</h1>
                  <p className="chat-viewer__header-meta">
                    {currentSession.messageCount.toLocaleString()} messages
                    {currentSession.isGroup && ` · ${currentSession.participants.length} members`}
                    {isFiltered && ` · ${results.length} results`}
                  </p>
                </div>
              </div>

              {/* Header actions */}
              <div className="chat-viewer__header-actions">
                <button
                  className={`chat-viewer__action-btn ${searchOpen ? 'chat-viewer__action-btn--active' : ''}`}
                  onClick={() => setSearchOpen(o => !o)}
                  aria-label="Search messages (Ctrl+F)"
                  title="Search (Ctrl+F)"
                  id="search-toggle-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
                <ThemeToggle />
              </div>
            </header>

            {/* Search Panel */}
            {searchOpen && (
              <SearchPanel
                search={search}
                onSearchChange={setSearch}
                resultCount={results.length}
                currentIndex={currentIndex}
                isFiltered={isFiltered}
                onNext={nextResult}
                onPrev={prevResult}
                onClear={clearSearch}
                onClose={() => { setSearchOpen(false); clearSearch(); }}
              />
            )}

            {/* Chat body */}
            <div
              className="chat-viewer__body"
              style={{
                backgroundImage: 'var(--bg-chat-pattern)',
                backgroundColor: 'var(--bg-chat)',
              }}
            >
              {messagesLoading ? (
                <div className="chat-viewer__msg-loading">
                  <div className="chat-viewer__loading-spinner" />
                  <p>Loading messages…</p>
                </div>
              ) : (
                <ChatList
                  ref={chatListRef}
                  messages={displayMessages}
                  participants={currentSession.participants}
                  isGroup={currentSession.isGroup}
                  searchQuery={isFiltered ? search.query : undefined}
                  highlightedMessageId={highlightedMsg?.id}
                  onMediaClick={handleMediaClick}
                />
              )}

              {/* Scroll to bottom FAB */}
              <button
                className="chat-viewer__scroll-btn"
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                title="Scroll to bottom"
                id="scroll-to-bottom-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Media Viewer Modal */}
      {mediaViewer && (
        <MediaViewer
          mediaKey={mediaViewer.mediaKey}
          type={mediaViewer.type}
          url={mediaViewer.url}
          onClose={() => setMediaViewer(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="chat-viewer__upload-overlay animate-fade-in" onClick={() => setShowUploadModal(false)}>
          <div
            className="chat-viewer__upload-modal animate-scale-in"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Upload new chat"
          >
            <div className="chat-viewer__upload-modal-header">
              <h2>Upload New Chat</h2>
              <button
                className="chat-viewer__upload-modal-close"
                onClick={() => setShowUploadModal(false)}
                aria-label="Close upload"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <UploadZone onSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};
