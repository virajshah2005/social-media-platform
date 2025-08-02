import React from 'react';
import { clsx } from 'clsx';

// Default avatar as a data URL (simple gray circle with user icon)
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallback = DEFAULT_AVATAR,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24'
  };

  const handleImageError = (e) => {
    e.target.src = fallback;
  };

  return (
    <img
      src={src || fallback}
      alt={alt}
      className={clsx(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      onError={handleImageError}
      {...props}
    />
  );
};

export default Avatar; 