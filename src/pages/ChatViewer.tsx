import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChatList } from '../components/ChatList';
import type { ChatListHandle } from '../components/ChatList';
import { Sidebar } from '../components/Sidebar';
import { SearchPanel } from '../components/SearchPanel';
import { MediaViewer } from '../components/MediaViewer';
import { UploadZone } from '../components/UploadZone';
import { useMessages, useAllSessions } from '../hooks/useChat';
import { useSearch } from '../hooks/useSearch';
import { processFile, type ProcessResult } from '../lib/zipHandler';

import { getSenderColor } from '../lib/colorUtils';
import { useSEO } from '../hooks/useSEO';
import './ChatViewer.css';

export const ChatViewer: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Data
  const { sessions, loading: sessionsLoading, reload: reloadSessions, removeSession, isDeleting, deleteProgress } = useAllSessions();
  const { messages, loading: messagesLoading } = useMessages(sessionId ?? null);
  const currentSession = sessions.find(s => s.id === sessionId);

  useSEO({
    title: currentSession ? `${currentSession.name} - Chat Viewer | ChatParser` : 'WhatsApp Chat Viewer | ChatParser',
    description: 'Securely view and search your WhatsApp chat exports. Private, local-first chat viewing with full media support.',
    canonical: '/chat'
  });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ mediaKey: string; type: string, url?: string | null } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isProcessingShared, setIsProcessingShared] = useState(false);
  const [shareProgress, setShareProgress] = useState(0);
  const isHandlingShareRef = useRef(false);

  // Refs
  const chatListRef = useRef<ChatListHandle>(null);

  // Handle shared file from PWA Share Target
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('share') === 'true' && !isHandlingShareRef.current) {
      isHandlingShareRef.current = true;
      const handleSharedFile = async () => {
        setIsProcessingShared(true);
        setShareProgress(0);
        try {
          const cache = await caches.open('shared-files');
          const response = await cache.match('/shared-file');
          if (response) {
            // First clean up from cache immediately to prevent duplicate runs
            await cache.delete('/shared-file');

            const blob = await response.blob();

            // Recover original filename from custom header
            const encodedName = response.headers.get('x-file-name');
            let fileName = encodedName ? decodeURIComponent(encodedName) : 'shared_chat.zip';

            // Ensure filename has an extension
            if (!fileName.includes('.')) {
              const isZip = blob.type.includes('zip') || blob.type.includes('octet-stream');
              fileName += isZip ? '.zip' : '.txt';
            }

            const file = new File([blob], fileName, { type: blob.type });
            const result = await processFile(file, (p) => setShareProgress(p));
            await reloadSessions();

            // Navigate to the new chat and REMOVE the ?share=true from history
            navigate(`/chat/${result.sessionId}`, { replace: true });
          }
        } catch (error) {
          console.error('Failed to process shared file:', error);
          alert('Failed to process the shared chat file.');
          // If error, also clear it
          navigate('/chat', { replace: true });
        } finally {
          setIsProcessingShared(false);
          setShareProgress(0);
        }
      };
      handleSharedFile();
    }
  }, [location.search, navigate, reloadSessions]);

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

  if (sessionsLoading || isProcessingShared || isDeleting) {
    return (
      <div className="chat-viewer__loading-screen">
        <div className="chat-viewer__loading-spinner" />
        <p>
          {isProcessingShared
            ? <>Processing shared chat… <strong>{shareProgress > 0 ? `${shareProgress}%` : ''}</strong></>
            : isDeleting
              ? <>Deleting chat… <strong>{deleteProgress > 0 ? `${deleteProgress}%` : ''}</strong></>
              : 'Loading your chats…'}
        </p>
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
                <img src="/chatparser.svg" alt="ChatParser Logo" width="100" height="100" style={{ borderRadius: '20px' }} />
              </div>
              <h1 className="chat-viewer__welcome-title">Chat<span className="logo-gradient">Parser</span></h1>
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
                <button
                  className="chat-viewer__action-btn"
                  onClick={() => window.dispatchEvent(new CustomEvent('chatparser:open-feedback'))}
                  aria-label="Give feedback"
                  title="Give feedback"
                  id="feedback-toggle-btn"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 122.39 122.88"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M68.99,23.46c10.66,0,19.96,0.09,30.61,0.09c1.22,0,2.38,0.11,3.51,0.32c1.12,0.21,2.2,0.52,3.2,0.95 c1.01,0.43,1.99,0.96,2.94,1.6c0.93,0.63,1.82,1.37,2.66,2.2c0.84,0.84,1.58,1.73,2.2,2.66c0.64,0.94,1.18,1.93,1.6,2.94 c0.42,1.01,0.74,2.08,0.95,3.2c0.21,1.13,0.32,2.3,0.32,3.51v35.27c0,1.22-0.11,2.38-0.32,3.51c-0.21,1.13-0.53,2.2-0.95,3.2 c-0.43,1.02-0.96,2-1.6,2.94c-0.63,0.93-1.37,1.82-2.2,2.66l-0.01,0.01c-0.87,0.85-1.77,1.59-2.71,2.21 c-0.93,0.63-1.92,1.16-2.93,1.59c-1.01,0.42-2.07,0.74-3.19,0.95c-1.11,0.21-2.28,0.32-3.48,0.32H86.29c-0.42,0-0.83,0.1-1.21,0.28 c-0.35,0.18-0.67,0.43-0.91,0.76l-0.02,0.02c-1.05,1.39-2.15,2.74-3.31,4.05c-1.16,1.29-2.36,2.55-3.66,3.74 c-1.26,1.17-2.58,2.29-3.95,3.37c-1.37,1.08-2.79,2.09-4.24,3.05c-1.39,0.92-2.86,1.79-4.39,2.62c-1.51,0.82-3.06,1.58-4.63,2.28 c-0.18,0.08-0.37,0.07-0.54-0.03c-0.29-0.17-0.4-0.54-0.23-0.84c0.28-0.5,0.55-0.99,0.83-1.52c0.26-0.49,0.5-0.98,0.73-1.51l0,0 c0.45-1,0.88-2.02,1.28-3.08c0.42-1.06,0.81-2.12,1.19-3.22c0.36-1.02,0.69-2.08,1.01-3.15c0.32-1.07,0.62-2.15,0.91-3.23 c0.08-0.32,0.16-0.64,0.16-0.97c0-0.72-0.29-1.39-0.77-1.87l-0.03-0.03c-0.49-0.49-1.17-0.8-1.9-0.8H47.13 c-1.22,0-2.37-0.11-3.48-0.32c-1.1-0.21-2.15-0.53-3.15-0.94l-0.02-0.01c-0.99-0.39-1.96-0.92-2.88-1.54 c-0.95-0.64-1.88-1.41-2.76-2.27l-0.01-0.01c-0.84-0.84-1.58-1.72-2.21-2.66c-0.64-0.94-1.17-1.92-1.6-2.94 c-0.42-1.01-0.74-2.08-0.95-3.2c-0.21-1.13-0.32-2.3-0.32-3.51v-7.17c0-3.6-4.66-3.63-5.44-1.06v8.18c0,1.54,0.15,3.04,0.42,4.48 c0.28,1.47,0.7,2.89,1.26,4.27c0.54,1.33,1.24,2.62,2.07,3.85c0.84,1.23,1.81,2.4,2.92,3.51c1.1,1.11,2.28,2.08,3.51,2.92 c1.22,0.83,2.5,1.52,3.83,2.06l0.02,0.01c1.37,0.56,2.8,0.97,4.26,1.26c1.44,0.27,2.94,0.42,4.48,0.42h11.12 c0.07,0,0.15,0.01,0.21,0.03c0.32,0.11,0.5,0.45,0.4,0.77l-0.01,0.02c-0.21,0.68-0.43,1.36-0.67,2.09l-0.01,0.04 c-0.34,0.98-0.72,1.99-1.12,2.99c-0.38,0.94-0.77,1.88-1.18,2.77c-0.01,0.05-0.02,0.09-0.04,0.14c-0.4,0.91-0.86,1.8-1.39,2.69 c-0.53,0.89-1.12,1.75-1.76,2.61c-0.66,0.86-1.4,1.72-2.22,2.6l-0.03,0.04c-0.83,0.88-1.72,1.74-2.69,2.58 c-0.55,0.5-0.86,1.18-0.9,1.86c-0.04,0.68,0.19,1.38,0.68,1.94c0.35,0.39,0.78,0.65,1.25,0.79c0.47,0.14,0.97,0.16,1.45,0.02 c2.02-0.54,4.01-1.14,5.94-1.8c1.93-0.66,3.8-1.38,5.59-2.16c1.81-0.78,3.58-1.63,5.29-2.56c1.7-0.91,3.36-1.91,4.95-2.96l0,0 c1.59-1.03,3.12-2.13,4.61-3.3c1.49-1.17,2.92-2.39,4.29-3.67l0.03-0.03c1.16-1.09,2.28-2.24,3.37-3.43 c1.1-1.21,2.16-2.45,3.15-3.72c0.11-0.17,0.3-0.28,0.52-0.28h11.7c1.57,0,3.07-0.15,4.52-0.42c1.46-0.28,2.86-0.7,4.2-1.25 l0.02-0.01c1.35-0.57,2.64-1.27,3.87-2.1c1.23-0.83,2.39-1.78,3.5-2.89c1.11-1.11,2.08-2.29,2.92-3.51 c0.83-1.23,1.53-2.52,2.07-3.85c0.55-1.35,0.97-2.76,1.26-4.23c0.27-1.44,0.42-2.95,0.42-4.52V40.84c0-1.57-0.15-3.08-0.42-4.52 c-0.28-1.47-0.7-2.88-1.26-4.22c-0.55-1.33-1.25-2.63-2.07-3.85c-0.84-1.24-1.81-2.41-2.91-3.51c-1.11-1.11-2.28-2.08-3.51-2.92 c-1.22-0.83-2.5-1.52-3.83-2.06l-0.02-0.01c-1.38-0.55-2.8-0.97-4.27-1.25c-1.44-0.27-2.94-0.42-4.48-0.42 c-11.07,0-20.79-0.05-31.87-0.05C65.11,18.79,64.94,23.46,68.99,23.46L68.99,23.46L68.99,23.46z M53.22,77.8 c-1.41,0.02-2.56-1.11-2.58-2.52c-0.02-1.41,1.11-2.56,2.52-2.58l27.03-0.41l5.18-0.33c1.41-0.09,2.62,0.98,2.71,2.38 c0.09,1.41-0.98,2.62-2.38,2.71l-5.18,0.33C80.52,77.38,55.5,77.76,53.22,77.8L53.22,77.8L53.22,77.8z M61.32,61.78 c-1.41,0-2.56-1.15-2.56-2.56c0-1.41,1.15-2.56,2.56-2.56h36.51c1.41,0,2.56,1.15,2.56,2.56c0,1.41-1.15,2.56-2.56,2.56H61.32 L61.32,61.78L61.32,61.78z M72.68,46.5c-1.41,0-2.56-1.15-2.56-2.56c0-1.41,1.15-2.56,2.56-2.56h25.14c1.41,0,2.56,1.15,2.56,2.56 c0,1.41-1.15,2.56-2.56,2.56H72.68L72.68,46.5L72.68,46.5z"
                      fill="currentColor"
                      opacity="0.8"
                    />
                    <path
                      d="M26.92,3.29c0.29-1.5,1.07-2.46,2.13-2.95c0.86-0.39,1.85-0.44,2.9-0.16c0.9,0.24,1.85,0.72,2.77,1.42 c2.47,1.87,4.78,5.42,5.07,9.84c0.09,1.36,0.06,2.81-0.06,4.36c-0.08,1.02-0.22,2.09-0.39,3.21h10.49L49.85,19 c1.71,0.06,3.35,0.48,4.75,1.21c1.21,0.63,2.22,1.49,2.92,2.57c0.72,1.11,1.12,2.42,1.06,3.92c-0.05,1.11-0.34,2.32-0.95,3.62 c0.35,1.45,0.51,3.01,0.28,4.38c-0.19,1.16-0.64,2.19-1.45,2.96c0.05,1.92-0.21,3.53-0.73,4.92c-0.53,1.43-1.32,2.62-2.35,3.67 c-0.09,0.92-0.24,1.8-0.47,2.62c-0.29,1.03-0.71,1.98-1.31,2.81l0,0c-1.79,2.52-3.22,2.47-5.48,2.37 c-0.31-0.01-0.66-0.03-1.18-0.03H24.43c-1.85,0-3.3-0.26-4.62-0.93c-1.32-0.66-2.43-1.66-3.63-3.16l-0.31-0.87V25.12l1.04-0.28 c2.65-0.71,4.73-2.98,6.35-5.68c1.66-2.79,2.83-6.05,3.63-8.68V3.55L26.92,3.29L26.92,3.29L26.92,3.29L26.92,3.29z M2.1,22.63h9.28 c1.16,0,2.1,0.95,2.1,2.1v27.96c0,1.16-0.95,2.1-2.1,2.1H2.1c-1.16,0-2.1-0.95-2.1-2.1V24.73C0,23.57,0.94,22.63,2.1,22.63 L2.1,22.63L2.1,22.63L2.1,22.63z"
                      fill="var(--brand-primary)"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
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
              } as React.CSSProperties}
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

      {/* Upload Modal */}
    </div>
  );
};
