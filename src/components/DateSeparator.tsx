import React from 'react';
import './DateSeparator.css';

interface DateSeparatorProps {
  label: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ label }) => {
  return (
    <div className="date-separator" role="separator" aria-label={label}>
      <span className="date-separator__label">{label}</span>
    </div>
  );
};
