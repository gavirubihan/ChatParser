// =============================================
// Privacy Mode — Session vs Persistent Storage
//
// 'persistent' (default): IndexedDB data survives tab close
// 'session':              IndexedDB data is wiped when the tab is freshly opened
//                         (not on page refresh — sessionStorage distinguishes the two)
// =============================================

import { deleteAllData } from './storage';

export type StorageMode = 'persistent' | 'session';

const PREF_KEY = 'chatParser_storageMode';
const SESSION_FLAG = 'chatParser_tabActive'; // set in sessionStorage; survives refresh, clears on close

// =============================================
// Get / Set user preference
// =============================================
export function getStorageMode(): StorageMode {
  try {
    const val = localStorage.getItem(PREF_KEY);
    return val === 'session' ? 'session' : 'persistent';
  } catch {
    return 'persistent';
  }
}

export function setStorageMode(mode: StorageMode): void {
  try {
    localStorage.setItem(PREF_KEY, mode);
  } catch {
    // localStorage not available (e.g. private browsing with strict settings)
  }
}

// =============================================
// Called once on startup to enforce session mode
// Returns true if data was wiped
// =============================================
export async function enforcePrivacyModeOnStartup(): Promise<boolean> {
  const mode = getStorageMode();

  if (mode === 'session') {
    const isRefresh = sessionStorage.getItem(SESSION_FLAG) === '1';

    if (!isRefresh) {
      // Tab was freshly opened (or closed and reopened) — wipe data
      try {
        await deleteAllData();
      } catch {
        // Ignore errors during wipe
      }
      sessionStorage.setItem(SESSION_FLAG, '1');
      return true; // data was wiped
    }
  } else {
    // Persistent mode — ensure session flag is set (so toggling back to session mid-session works correctly)
    sessionStorage.setItem(SESSION_FLAG, '1');
  }

  return false;
}

// =============================================
// Called when mode is toggled at runtime
// =============================================
export function onModeChanged(newMode: StorageMode): void {
  setStorageMode(newMode);

  if (newMode === 'session') {
    // Mark this tab as "active" so a refresh in same tab doesn't wipe data
    sessionStorage.setItem(SESSION_FLAG, '1');
  }
}
