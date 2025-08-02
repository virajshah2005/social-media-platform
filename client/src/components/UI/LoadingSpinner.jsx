import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
        <div className={`spinner ${sizeClasses[size]} ${className}`} data-testid={`loading-spinner-${size}`} role="progressbar"></div>
  );
};

export default LoadingSpinner; 