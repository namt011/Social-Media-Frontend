import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ small = false }) => (
  <div className="spinner-container">
    <div className={`loading-spinner ${small ? 'small' : ''}`}></div>
  </div>
);

export default LoadingSpinner;