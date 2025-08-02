import React, { useState } from 'react';
import { FiImage } from 'react-icons/fi';

const Image = ({ src, alt, className = '', fallback = '/default-avatar.svg', ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-social-card">
          <div className="animate-pulse">
            <FiImage className="w-8 h-8 text-social-textSecondary" />
          </div>
        </div>
      )}
      <img
        src={hasError ? fallback : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoading ? 'invisible' : 'visible'}`}
        {...props}
      />
    </div>
  );
};

export default Image;
