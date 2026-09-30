import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './ContactViewer.css';

// =============================================
// VCF Parser
// =============================================
interface VCardData {
  fullName: string;
  phones: { type: string; number: string }[];
  emails: { type: string; address: string }[];
  org: string;
  title: string;
  note: string;
  birthday: string;
  address: string;
}

function parseVcf(raw: string): VCardData {
  const lines: string[] = [];

  // Unfold RFC 2425 folded lines (continuation lines start with space/tab)
  for (const line of raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  const data: VCardData = {
    fullName: '', phones: [], emails: [],
    org: '', title: '', note: '', birthday: '', address: '',
  };

  for (const line of lines) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const propRaw = line.slice(0, sep).toUpperCase();
    const value = line.slice(sep + 1).trim();
    if (!value) continue;

    const propName = propRaw.split(';')[0];
    const typeMatch = propRaw.match(/TYPE=([^;:]+)/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : '';

    switch (propName) {
      case 'FN':
        data.fullName = decodeQP(value);
        break;
      case 'N':
        if (!data.fullName) {
          const parts = value.split(';').map(p => decodeQP(p.trim())).filter(Boolean);
          data.fullName = [parts[1], parts[0]].filter(Boolean).join(' ');
        }
        break;
      case 'TEL':
        data.phones.push({ type: friendlyType(type, 'Phone'), number: value.replace(/\s/g, '') });
        break;
      case 'EMAIL':
        data.emails.push({ type: friendlyType(type, 'Email'), address: value });
        break;
      case 'ORG':
        data.org = decodeQP(value.split(';')[0]);
        break;
      case 'TITLE':
        data.title = decodeQP(value);
        break;
      case 'NOTE':
        data.note = decodeQP(value).replace(/\\n/g, '\n');
        break;
      case 'BDAY':
        data.birthday = formatBday(value);
        break;
      case 'ADR': {
        const parts = value.split(';').map(p => decodeQP(p.trim())).filter(Boolean);
        data.address = parts.join(', ');
        break;
      }
    }
  }
  return data;
}

function decodeQP(s: string): string {
  return s.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function friendlyType(raw: string, fallback: string): string {
  if (!raw) return fallback;
  const map: Record<string, string> = {
    cell: 'Mobile', mobile: 'Mobile', home: 'Home', work: 'Work',
    voice: 'Voice', fax: 'Fax', pager: 'Pager', other: 'Other',
  };
  return map[raw.toLowerCase()] ?? (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase());
}

function formatBday(raw: string): string {
  const c = raw.replace(/\D/g, '');
  if (c.length === 8) {
    try {
      return new Date(`${c.slice(0, 4)}-${c.slice(4, 6)}-${c.slice(6, 8)}`)
        .toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { /* fall through */ }
  }
  return raw;
}

// =============================================
// Modal
// =============================================
export interface ContactViewerProps {
  fileName: string;
  url: string;
  onClose: () => void;
}

export const ContactViewer: React.FC<ContactViewerProps> = ({ fileName, url, onClose }) => {
  const [contact, setContact] = useState<VCardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(url)
      .then(r => r.text())
      .then(text => setContact(parseVcf(text)))
      .catch(() => setError('Could not read the contact file.'));
  }, [url]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const initials = contact?.fullName
    ? contact.fullName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return createPortal(
    <div className="cv-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Contact details">
      <div className="cv-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="cv-header">
          <div className="cv-avatar">{initials}</div>
          <div className="cv-header-text">
            <h2 className="cv-name">{contact?.fullName || fileName}</h2>
            {contact?.title && <p className="cv-subtitle">{contact.title}</p>}
            {contact?.org   && <p className="cv-org">{contact.org}</p>}
          </div>
          <button className="cv-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="cv-body">
          {error && <p className="cv-error">{error}</p>}
          {contact && (
            <>
              {contact.phones.length > 0 && (
                <div className="cv-section">
                  {contact.phones.map((p, i) => (
                    <div key={i} className="cv-row">
                      <span className="cv-row-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </span>
                      <div className="cv-row-content">
                        <a href={`tel:${p.number}`} className="cv-row-value">{p.number}</a>
                        <span className="cv-row-label">{p.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {contact.emails.length > 0 && (
                <div className="cv-section">
                  {contact.emails.map((e, i) => (
                    <div key={i} className="cv-row">
                      <span className="cv-row-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      <div className="cv-row-content">
                        <a href={`mailto:${e.address}`} className="cv-row-value">{e.address}</a>
                        <span className="cv-row-label">{e.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {contact.address && (
                <div className="cv-section">
                  <div className="cv-row">
                    <span className="cv-row-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <div className="cv-row-content">
                      <span className="cv-row-value">{contact.address}</span>
                      <span className="cv-row-label">Address</span>
                    </div>
                  </div>
                </div>
              )}

              {contact.birthday && (
                <div className="cv-section">
                  <div className="cv-row">
                    <span className="cv-row-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <div className="cv-row-content">
                      <span className="cv-row-value">{contact.birthday}</span>
                      <span className="cv-row-label">Birthday</span>
                    </div>
                  </div>
                </div>
              )}

              {contact.note && (
                <div className="cv-section">
                  <div className="cv-row">
                    <span className="cv-row-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </span>
                    <div className="cv-row-content">
                      <span className="cv-row-value cv-row-value--note">{contact.note}</span>
                      <span className="cv-row-label">Note</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="cv-footer">
          <a href={url} download={fileName} className="cv-btn cv-btn--secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download .vcf
          </a>
          <button className="cv-btn cv-btn--primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
