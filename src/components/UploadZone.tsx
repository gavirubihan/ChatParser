import React, { useRef, useState, useCallback } from 'react';
import { processFile } from '../lib/zipHandler';
import type { ProcessResult } from '../lib/zipHandler';
import './UploadZone.css';

interface UploadZoneProps {
  onSuccess: (result: ProcessResult) => void;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onSuccess, compact = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await processFile(file, (p) => setProgress(p));
      onSuccess(result);
    } catch (err) {
      setError((err as Error).message || 'Failed to process file.');
    } finally {
      setIsProcessing(false);
    }
  }, [onSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  return (
    <div className={`upload-zone ${compact ? 'upload-zone--compact' : ''}`}>
      {/* Drop area */}
      <div
        className={`upload-zone__drop-area ${isDragging ? 'upload-zone__drop-area--dragging' : ''} ${isProcessing ? 'upload-zone__drop-area--processing' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload WhatsApp chat export file"
        onKeyDown={e => e.key === 'Enter' && !isProcessing && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          id="file-upload-input"
          type="file"
          accept=".txt,.zip"
          onChange={handleInputChange}
          className="upload-zone__input"
          aria-label="Select WhatsApp export file"
        />

        {isProcessing ? (
          <div className="upload-zone__processing">
            <div className="upload-zone__spinner-ring">
              <svg viewBox="0 0 60 60" className="upload-zone__spinner-svg">
                <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border-default)" strokeWidth="4" />
                <circle
                  cx="30" cy="30" r="26" fill="none"
                  stroke="var(--brand-primary)" strokeWidth="4"
                  strokeDasharray={`${progress * 1.635} 163.5`}
                  strokeLinecap="round"
                  strokeDashoffset="41"
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
              </svg>
              <span className="upload-zone__progress-pct">{progress}%</span>
            </div>
            <p className="upload-zone__processing-label">
              {progress < 30 ? 'Reading file…' : progress < 70 ? 'Extracting media…' : 'Saving to storage…'}
            </p>
            {fileName && (
              <p className="upload-zone__file-name">{fileName}</p>
            )}
          </div>
        ) : (
          <div className="upload-zone__idle">
            <div className={`upload-zone__icon ${isDragging ? 'upload-zone__icon--active' : ''}`}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            {!compact && (
              <>
                <h3 className="upload-zone__title">
                  {isDragging ? 'Drop your chat file here' : 'Upload WhatsApp Export'}
                </h3>
                <p className="upload-zone__subtitle">
                  Drag & drop your <strong>.txt</strong> or <strong>.zip</strong> file, or click to browse
                </p>
                <div className="upload-zone__badges">
                  <span className="upload-zone__badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                    .txt
                  </span>
                  <span className="upload-zone__badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 10H3M16 2l5 5-5 5M8 22l-5-5 5-5"/></svg>
                    .zip
                  </span>
                  <span className="upload-zone__badge upload-zone__badge--secure">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    100% Private
                  </span>
                </div>
              </>
            )}
            {compact && (
              <p className="upload-zone__compact-label">Drop .txt or .zip file</p>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="upload-zone__error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
          <button className="upload-zone__error-dismiss" onClick={() => setError(null)} aria-label="Dismiss error">×</button>
        </div>
      )}
    </div>
  );
};
