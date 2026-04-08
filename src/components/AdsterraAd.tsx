import React, { useMemo } from 'react';
import './AdsterraAd.css';

interface AdsterraAdProps {
  adUrl: string | null | undefined;
  side?: 'left' | 'right';
}

/**
 * AdsterraAd Component — styled to match ChatBubble exactly.
 *
 * Uses iframe srcdoc isolation so each Virtuoso mount gets a
 * fresh browsing context with no global-state conflicts.
 */
export const AdsterraAd: React.FC<AdsterraAdProps> = ({ adUrl, side = 'left' }) => {
  const keyMatch = adUrl ? adUrl.match(/\/([a-f0-9]{32})\//) : null;
  const adKey = keyMatch ? keyMatch[1] : null;

  const resolvedUrl = useMemo(() => {
    if (!adUrl) return null;
    return adUrl.startsWith('//') ? `https:${adUrl}` : adUrl;
  }, [adUrl]);

  if (!resolvedUrl || !adKey) return null;

  const isOwn = side === 'right';

  // Self-contained ad page — runs cleanly inside the sandboxed iframe
  const srcdoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body {
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #container-${adKey} {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #container-${adKey} iframe {
      max-width: 100% !important;
      display: block !important;
    }
  </style>
</head>
<body>
  <div id="container-${adKey}"></div>
  <script async="async" data-cfasync="false" src="${resolvedUrl}"></script>
</body>
</html>`;

  return (
    // Same wrapper structure as .chat-bubble__wrapper
    <div className={`ad-bubble__wrapper${isOwn ? ' ad-bubble__wrapper--own' : ''}`}>
      {/* Avatar circle — only on the left (incoming) side */}
      {!isOwn && (
        <div className="ad-bubble__avatar" aria-hidden="true">
          Ad
        </div>
      )}

      {/* Bubble shell — matches .chat-bubble styling */}
      <div className={`ad-bubble${isOwn ? ' ad-bubble--own' : ' ad-bubble--other'}`}>
        {/* Sender-style label at the top */}
        <div className="ad-bubble__label">Sponsored</div>

        {/* Ad iframe — fills like a media attachment */}
        <iframe
          srcDoc={srcdoc}
          className="ad-bubble__frame"
          title="Advertisement"
          scrolling="no"
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
};
