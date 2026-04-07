import React, { useEffect, useRef } from 'react';
import type { SearchState } from '../hooks/useSearch';
import type { MessageType } from '../lib/chatParser';
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

const FILTER_TYPES: { type: MessageType | 'all'; label: string; icon: React.ReactNode }[] = [
  { 
    type: 'all', 
    label: 'All', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg> 
  },
  { 
    type: 'image', 
    label: 'Images', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> 
  },
  { 
    type: 'video', 
    label: 'Videos', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg> 
  },
  { 
    type: 'audio', 
    label: 'Voice', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg> 
  },
  { 
    type: 'document', 
    label: 'Docs', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> 
  },
  { 
    type: 'sticker', 
    label: 'Stickers', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/></svg> 
  },
  { 
    type: 'location', 
    label: 'Places', 
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> 
  },
];

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

        {/* Filter Chips */}
        <div className="search-panel__filters">
          {FILTER_TYPES.map(filter => (
            <button
              key={filter.type}
              className={`search-panel__filter-chip ${search.type === filter.type ? 'search-panel__filter-chip--active' : ''}`}
              onClick={() => onSearchChange({ ...search, type: filter.type })}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          ))}
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
