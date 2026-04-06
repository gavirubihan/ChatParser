import React, { useState, useEffect, useCallback } from 'react';
import { getMediaUrl } from '../lib/mediaUtils';
import './MediaViewer.css';

interface MediaViewerProps {
  mediaKey: string;
  type: string;
  url?: string | null;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ mediaKey, type, url: initialUrl, onClose }) => {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [loading, setLoading] = useState(!initialUrl);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (initialUrl) return;
    let active = true;
    getMediaUrl(mediaKey).then(u => {
      if (active) { setUrl(u); setLoading(false); }
    });
    return () => { active = false; };
  }, [mediaKey, initialUrl]);

  const handleClose = useCallback(() => {
    setClosing(true);
  }, []);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    // Only respond to the outermost overlay animation ending
    if (e.target === e.currentTarget && closing) onClose();
  }, [closing, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  return (
    <div
      className={`media-viewer${closing ? ' media-viewer--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="media-viewer__content" onClick={e => e.stopPropagation()}>
        <button className="media-viewer__close" onClick={handleClose} aria-label="Close media viewer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {loading && (
          <div className="media-viewer__loading">
            <div className="media-viewer__spinner" />
          </div>
        )}

        {!loading && !url && (
          <div className="media-viewer__error">
            <span>Media not available</span>
          </div>
        )}

        {url && (type === 'image' || type === 'sticker' || type === 'gif') && (
          <img src={url} alt="Media" className="media-viewer__image" decoding="async" />
        )}

        {url && type === 'video' && (
          <video src={url} controls autoPlay className="media-viewer__video" />
        )}

        {url && (
          <a
            href={url}
            download
            className="media-viewer__download"
            onClick={e => e.stopPropagation()}
            aria-label="Download media"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </a>
        )}
      </div>
    </div>
  );
};
