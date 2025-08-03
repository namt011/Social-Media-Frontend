import React from 'react';
import './ErrorAlert.css';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="error-alert">
      <span className="error-message">{error}</span>
      <button className="close-button" onClick={onClose}>&times;</button>
    </div>
  );
};

export default ErrorAlert;