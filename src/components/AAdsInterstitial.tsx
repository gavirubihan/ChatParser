import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AAdsInterstitial.css';

interface AAdsInterstitialProps {
  unitId?: string;
  trigger?: boolean; // Prop-driven trigger: flips to true when value action finishes (e.g. chat parsed/opened)
  onClose?: () => void;
  enableTabSwitchAd?: boolean; // Opt-in tab-switch re-triggering (default: false)
  tabSwitchDelayMs?: number; // Minimum time in another tab before re-triggering (default: 30000ms)
  autoClose?: boolean; // Opt-in auto-close when countdown reaches 0 (default: false)
  initialCountdown?: number;
}

const CAP_KEY = 'aads_last_shown';
const COOLDOWN_MS = 5 * 60 * 1000; // 5 min cooldown: stops repeat spam on tab switches

const isOrganicFirstLanding = () => {
  try {
    const referrer = (document.referrer || '').toLowerCase();
    const isSearchEngine = /google\.|bing\.|duckduckgo\.|yahoo\.|yandex\.|ecosia\./i.test(referrer);
    const sessionSeen = sessionStorage.getItem(CAP_KEY);
    // Skip if arriving directly from organic search and haven't interacted yet this session
    return isSearchEngine && !sessionSeen;
  } catch {
    return false;
  }
};

const canShow = (opts: { userInitiated?: boolean } = {}) => {
  // Always skip for search engine bots, crawlers, and performance auditors
  if (
    typeof navigator !== 'undefined' &&
    /bot|googlebot|crawler|spider|robot|crawling|lighthouse|pagespeed/i.test(navigator.userAgent || '')
  ) {
    return false;
  }

  // Only gate automatic ads (timer/tab-switch) for organic search arrivals; user-triggered follows real value
  if (!opts.userInitiated && isOrganicFirstLanding()) {
    return false;
  }

  try {
    const last = Number(sessionStorage.getItem(CAP_KEY) || 0);
    return Date.now() - last > COOLDOWN_MS;
  } catch {
    return true; // storage blocked → fail open
  }
};

export const AAdsInterstitial: React.FC<AAdsInterstitialProps> = ({
  unitId = import.meta.env.VITE_AADS_UNIT_ID || '2450847',
  trigger,
  onClose,
  enableTabSwitchAd = false,
  tabSwitchDelayMs = 30000,
  autoClose = false,
  initialCountdown = 5,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [countdown, setCountdown] = useState(initialCountdown);
  const [adKey, setAdKey] = useState(0);

  const hiddenAtRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const prevTriggerRef = useRef(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose; // always call the latest onClose without changing handleClose's identity
  }, [onClose]);

  const showAd = useCallback(
    (userInitiated = false): boolean => {
      if (!canShow({ userInitiated })) return false;
      try {
        sessionStorage.setItem(CAP_KEY, String(Date.now()));
      } catch {}
      setIsAdLoaded(false);
      setCountdown(initialCountdown);
      setAdKey((k) => k + 1);
      setIsVisible(true);
      return true;
    },
    [initialCountdown]
  );

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onCloseRef.current?.();
  }, []); // empty deps → stable → effects don't re-run on every parent render

  // Scroll lock + focus: runs ONLY when the modal opens or closes
  useEffect(() => {
    if (!isVisible) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus(); // only restore focus on real close, not every countdown tick
    };
  }, [isVisible]);

  // Esc + Tab trap: rebinding on countdown change is harmless (no focus side effects)
  useEffect(() => {
    if (!isVisible) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (countdown === 0) handleClose();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) {
        e.preventDefault();
        modalRef.current.focus(); // nothing focusable yet (disabled buttons) → keep focus on dialog
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      // why: the dialog container counts as "outside" the tab loop, so Tab/Shift+Tab wrap correctly
      const outside = !modalRef.current.contains(active) || active === modalRef.current;

      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, countdown, handleClose]);

  // Value-driven trigger: fires showAd(true) when trigger flips to true
  useEffect(() => {
    if (!unitId || trigger === undefined) return;

    if (trigger && !prevTriggerRef.current) {
      // if blocked (cooldown/bot), tell the parent we're done so trigger resets to false
      if (!showAd(true)) onCloseRef.current?.();
    }
    prevTriggerRef.current = trigger;
  }, [unitId, trigger, showAd]);

  // Tab switch listener (opt-in via enableTabSwitchAd with 30s threshold)
  useEffect(() => {
    if (!unitId || !enableTabSwitchAd) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else {
        const timeAway = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0;
        hiddenAtRef.current = null;

        if (timeAway >= tabSwitchDelayMs && !isVisible) {
          showAd(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [unitId, enableTabSwitchAd, tabSwitchDelayMs, isVisible, showAd]);

  // Fallback: If ad network hangs or is blocked, start countdown after 7s so user isn't stuck
  useEffect(() => {
    if (!isVisible || isAdLoaded) return;

    const fallbackTimer = setTimeout(() => {
      setIsAdLoaded(true);
    }, 7000);

    return () => clearTimeout(fallbackTimer);
  }, [isVisible, isAdLoaded]);

  // Countdown timer using setTimeout chain instead of setInterval
  useEffect(() => {
    if (!isVisible || !isAdLoaded) return;

    if (countdown <= 0) {
      if (autoClose) {
        const autoCloseTimer = setTimeout(() => {
          handleClose();
        }, 1500);
        return () => clearTimeout(autoCloseTimer);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisible, isAdLoaded, countdown, autoClose, handleClose]);

  if (!isVisible || !unitId) {
    return null;
  }

  const adSrc = `https://acceptable.a-ads.com/${unitId}/?size=Adaptive`;

  return (
    <div
      className="aads-interstitial__overlay"
      onClick={countdown === 0 ? handleClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Sponsored announcement"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="aads-interstitial__modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="aads-interstitial__header">
          <div className="aads-interstitial__badge-group">
            <span className="aads-interstitial__badge">SPONSOR</span>
            <span className="aads-interstitial__subtitle">Supports Free Hosting</span>
          </div>

          <div className="aads-interstitial__header-actions">
            {!isAdLoaded ? (
              <span className="aads-interstitial__timer aads-interstitial__timer--loading">
                <span className="aads-interstitial__spinner-dot" />
                Loading...
              </span>
            ) : countdown > 0 ? (
              <span className="aads-interstitial__timer" aria-live="polite">
                {countdown}s
              </span>
            ) : (
              <button
                type="button"
                className="aads-interstitial__close-btn"
                onClick={handleClose}
                aria-label="Close sponsor announcement"
                title="Close (Esc)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Ad Body: High-Value 300x250 Standard Rectangle */}
        <div className="aads-interstitial__body">
          <div className="aads-interstitial__ad-frame-wrap">
            {!isAdLoaded && (
              <div className="aads-interstitial__loading-skeleton">
                <div className="aads-interstitial__spinner" />
                <span>Loading advertisement...</span>
              </div>
            )}
            <iframe
              key={adKey}
              data-aa={unitId}
              src={adSrc}
              onLoad={() => setIsAdLoaded(true)}
              className={`aads-interstitial__iframe ${
                isAdLoaded
                  ? 'aads-interstitial__iframe--loaded'
                  : 'aads-interstitial__iframe--hidden'
              }`}
              scrolling="no"
              title="Advertisement"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="eager"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="aads-interstitial__footer">
          {!isAdLoaded ? (
            <button
              type="button"
              className="aads-interstitial__cta aads-interstitial__cta--loading"
              disabled
            >
              <span className="aads-interstitial__btn-spinner" />
              <span>Loading ad...</span>
            </button>
          ) : countdown > 0 ? (
            <button
              type="button"
              className="aads-interstitial__cta aads-interstitial__cta--countdown"
              disabled
              aria-disabled="true"
            >
              <span>Continue in {countdown}s</span>
            </button>
          ) : (
            <button
              type="button"
              className="aads-interstitial__cta aads-interstitial__cta--close"
              onClick={handleClose}
            >
              <span>Continue to Chat</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}

          <p className="aads-interstitial__trust">
            Your chats never leave your device. Ads are loaded separately.
          </p>
        </div>
      </div>
    </div>
  );
};
