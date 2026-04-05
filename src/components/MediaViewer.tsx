import React, { useState, useEffect } from 'react';
import { getMediaUrl } from '../lib/mediaUtils';
import './MediaViewer.css';

interface MediaViewerProps {
  mediaKey: string;
  type: string;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ mediaKey, type, onClose }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMediaUrl(mediaKey).then(u => {
      if (active) { setUrl(u); setLoading(false); }
    });
    return () => { active = false; };
  }, [mediaKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="media-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={onClose}
    >
      <div className="media-viewer__content" onClick={e => e.stopPropagation()}>
        <button className="media-viewer__close" onClick={onClose} aria-label="Close media viewer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
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
          <img src={url} alt="Media" className="media-viewer__image" />
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Download
          </a>
        )}
      </div>
    </div>
  );
};
