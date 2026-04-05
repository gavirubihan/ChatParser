import { useState, useMemo, useCallback } from 'react';
import type { ChatMessage } from '../lib/chatParser';

export interface SearchState {
  query: string;
  fromDate: string;
  toDate: string;
}

export function useSearch(messages: ChatMessage[]) {
  const [search, setSearch] = useState<SearchState>({ query: '', fromDate: '', toDate: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const results = useMemo(() => {
    const q = search.query.toLowerCase().trim();
    const from = search.fromDate ? new Date(search.fromDate) : null;
    const to = search.toDate ? new Date(search.toDate + 'T23:59:59') : null;

    if (!q && !from && !to) return messages;

    return messages.filter(msg => {
      const textMatch = q ? msg.content.toLowerCase().includes(q) : true;
      const fromMatch = from ? msg.timestamp >= from : true;
      const toMatch = to ? msg.timestamp <= to : true;
      return textMatch && fromMatch && toMatch;
    });
  }, [messages, search]);

  const isFiltered = search.query !== '' || search.fromDate !== '' || search.toDate !== '';

  const clearSearch = useCallback(() => {
    setSearch({ query: '', fromDate: '', toDate: '' });
    setCurrentIndex(0);
  }, []);

  const nextResult = useCallback(() => {
    setCurrentIndex(i => (i + 1) % results.length);
  }, [results.length]);

  const prevResult = useCallback(() => {
    setCurrentIndex(i => (i - 1 + results.length) % results.length);
  }, [results.length]);

  return {
    search, setSearch,
    results, isFiltered,
    isOpen, setIsOpen,
    currentIndex, setCurrentIndex,
    clearSearch, nextResult, prevResult,
  };
}
