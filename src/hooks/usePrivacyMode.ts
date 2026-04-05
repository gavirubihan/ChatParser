import { useState, useCallback } from 'react';
import { getStorageMode, setStorageMode, onModeChanged } from '../lib/privacyMode';
import type { StorageMode } from '../lib/privacyMode';

export function usePrivacyMode() {
  const [mode, setMode] = useState<StorageMode>(getStorageMode);

  const toggle = useCallback(() => {
    setMode(prev => {
      const next: StorageMode = prev === 'persistent' ? 'session' : 'persistent';
      setStorageMode(next);
      onModeChanged(next);
      return next;
    });
  }, []);

  const changeMode = useCallback((newMode: StorageMode) => {
    setStorageMode(newMode);
    onModeChanged(newMode);
    setMode(newMode);
  }, []);

  return { mode, toggle, changeMode };
}
