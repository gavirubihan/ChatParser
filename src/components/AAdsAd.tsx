import React from 'react';
import './AAdsAd.css';

interface AAdsAdProps {
  unitId: string | null | undefined;
  side?: 'left' | 'right';
}

/**
 * AAdsAd Component — Anonymous Ads (A-ADS) replacement for Adsterra.
 *
 * A-ADS serves ads via a plain iframe pointed at acceptable.a-ads.com.
 * We wrap it in an outer srcdoc-isolated iframe so the Virtuoso virtual
 * list gets a stable, sandboxed browsing context per mount — same
 * strategy as the previous Adsterra implementation.
 *
 * The iframe src uses HTTPS explicitly (never protocol-relative) to
 * avoid mixed-content warnings on modern browsers.
 */
export const AAdsAd: React.FC<AAdsAdProps> = ({ unitId, side = 'left' }) => {
  if (!unitId) return null;

  const isOwn = side === 'right';

  // The A-ADS embed URL. size=Adaptive lets the network pick the best
  // format for the available bubble width (~250px on our layout).
  const adSrc = `https://acceptable.a-ads.com/${unitId}/?size=Adaptive`;

  // Self-contained srcdoc so each virtual-list row gets its own iframe
  // context — prevents ad script state leaking across unmount/remount cycles.
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
    iframe {
      border: 0;
      padding: 0;
      width: 100%;
      height: auto;
      overflow: hidden;
      display: block;
      margin: auto;
    }
  </style>
</head>
<body>
  <iframe
    data-aa="${unitId}"
    src="${adSrc}"
    scrolling="no"
    style="border:0;padding:0;width:100%;height:auto;overflow:hidden;display:block;margin:auto"
  ></iframe>
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

        {/* Outer sandbox iframe wrapping the A-ADS iframe */}
        <iframe
          srcDoc={srcdoc}
          className="ad-bubble__frame"
          title="Advertisement"
          scrolling="no"
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};
