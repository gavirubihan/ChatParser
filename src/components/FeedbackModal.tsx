import React from 'react';
import './FeedbackModal.css';
import { FeedbackForm } from './FeedbackForm';

interface FeedbackModalProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
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
          <FeedbackForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
};
