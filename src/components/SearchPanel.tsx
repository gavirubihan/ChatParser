import React, { useEffect, useRef } from 'react';
import type { SearchState } from '../hooks/useSearch';
import './SearchPanel.css';

interface SearchPanelProps {
  search: SearchState;
  onSearchChange: (s: SearchState) => void;
  resultCount: number;
  currentIndex: number;
  isFiltered: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClear: () => void;
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  search,
  onSearchChange,
  resultCount,
  currentIndex,
  isFiltered,
  onNext,
  onPrev,
  onClear,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.shiftKey ? onPrev() : onNext();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="search-panel animate-fade-in-up" role="search" aria-label="Search messages">
      <div className="search-panel__inner">
        {/* Search input */}
        <div className="search-panel__input-group">
          <svg className="search-panel__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            className="search-panel__input"
            placeholder="Search messages..."
            value={search.query}
            onChange={e => onSearchChange({ ...search, query: e.target.value })}
            onKeyDown={handleKeyDown}
            aria-label="Search text in messages"
          />
          {search.query && (
            <button
              className="search-panel__clear-btn"
              onClick={() => onSearchChange({ ...search, query: '' })}
              aria-label="Clear search text"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="search-panel__date-row">
          <div className="search-panel__date-field">
            <label htmlFor="search-from" className="search-panel__date-label">From</label>
            <input
              id="search-from"
              type="date"
              className="search-panel__date-input"
              value={search.fromDate}
              onChange={e => onSearchChange({ ...search, fromDate: e.target.value })}
              aria-label="Search from date"
            />
          </div>
          <div className="search-panel__date-field">
            <label htmlFor="search-to" className="search-panel__date-label">To</label>
            <input
              id="search-to"
              type="date"
              className="search-panel__date-input"
              value={search.toDate}
              onChange={e => onSearchChange({ ...search, toDate: e.target.value })}
              aria-label="Search to date"
            />
          </div>
        </div>

        {/* Results & navigation */}
        <div className="search-panel__results-row">
          {isFiltered ? (
            <>
              <span className="search-panel__count">
                {resultCount === 0
                  ? 'No results'
                  : `${currentIndex + 1} of ${resultCount}`}
              </span>
              <div className="search-panel__nav">
                <button
                  className="search-panel__nav-btn"
                  onClick={onPrev}
                  disabled={resultCount === 0}
                  aria-label="Previous result"
                  title="Previous (Shift+Enter)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
                  </svg>
                </button>
                <button
                  className="search-panel__nav-btn"
                  onClick={onNext}
                  disabled={resultCount === 0}
                  aria-label="Next result"
                  title="Next (Enter)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
                  </svg>
                </button>
              </div>
              <button className="search-panel__reset-btn" onClick={onClear} aria-label="Clear all filters">
                Reset
              </button>
            </>
          ) : (
            <span className="search-panel__hint">Press Enter to search · Shift+Enter for previous</span>
          )}
          <button className="search-panel__close-btn" onClick={onClose} aria-label="Close search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
