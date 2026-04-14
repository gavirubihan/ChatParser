import React, { useState } from 'react';
import './FeedbackModal.css';

interface FeedbackModalProps {
  onClose: () => void;
}

type FeedbackType = 'Bug' | 'Feature Request' | 'Suggestion' | 'Other';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [type, setType] = useState<FeedbackType>('Bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const formspreeId = import.meta.env.VITE_FORMSPREE_ID;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || (type === 'Bug' && !email.trim())) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          type,
          message,
          email,
          url: window.location.href,
        })
      });

      if (response.ok) {
        setStatus('success');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send feedback. Please try again later.');
    }
  };

  return (
    <div className="feedback-modal__overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="feedback-modal__header">
          <h2>Give Feedback</h2>
          <button className="feedback-modal__close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="feedback-modal__body">
          {status === 'success' ? (
            <div className="feedback-modal__success">
              <div className="feedback-modal__success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>Thank You!</h3>
              <p>Your feedback has been received. We appreciate your help in making ChatParser better!</p>
              <button
                className="feedback-modal__submit"
                style={{ marginTop: 'var(--space-4)' }}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : (
            <form className="feedback-modal__form" onSubmit={handleSubmit}>
              <div className="feedback-modal__group">
                <label className="feedback-modal__label">Feedback Type</label>
                <div className="feedback-modal__type-grid">
                  {[
                    { id: 'Bug' as FeedbackType, label: 'Bug Report', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 2 1.88 1.88" /><path d="M14.12 3.88 16 2" /><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" /><path d="M12 20c-3.31 0-6-2.69-6-6v-1h4v2l.59.59c.78.78 2.05.78 2.83 0l.58-.59V13h4v1c0 3.31-2.69 6-6 6Z" /><path d="M6 13V9c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v4" /><path d="M20 13h-2" /><path d="M4 13h2" /><path d="m17 7 1.5-1.5" /><path d="m7 7-1.5-1.5" /></svg> },
                    { id: 'Feature Request' as FeedbackType, label: 'Feature', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg> },
                    { id: 'Suggestion' as FeedbackType, label: 'Suggestion', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg> },
                    { id: 'Other' as FeedbackType, label: 'Other', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg> },
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      className={`feedback-modal__type-card ${type === option.id ? 'active' : ''}`}
                      onClick={() => setType(option.id)}
                    >
                      <div className="feedback-modal__type-icon">
                        {option.icon}
                      </div>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="feedback-modal__group">
                <label className="feedback-modal__label">Message</label>
                <textarea
                  className="feedback-modal__textarea"
                  placeholder="Tell us what's on your mind..."
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <span className="feedback-modal__hint">Please be as descriptive as possible.</span>
              </div>

              <div className="feedback-modal__group">
                <label className="feedback-modal__label">
                  Email {type === 'Bug' && <span style={{ color: 'var(--status-error)' }}>*</span>}
                  {type !== 'Bug' && ' (Optional)'}
                </label>
                <input
                  type="email"
                  className="feedback-modal__input"
                  placeholder="your@email.com"
                  required={type === 'Bug'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <span className="feedback-modal__hint">
                  {type === 'Bug' 
                    ? 'Required so we can follow up with you about this bug.' 
                    : "Only if you'd like us to follow up with you."}
                </span>
              </div>

              {status === 'error' && (
                <div style={{ color: 'var(--status-error)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                  {errorMessage}
                </div>
              )}

              <div className="feedback-modal__footer">
                <button
                  type="submit"
                  className="feedback-modal__submit"
                  disabled={status === 'submitting' || !message.trim() || (type === 'Bug' && !email.trim())}
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="spinner" />
                      Sending...
                    </>
                  ) : 'Send Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
