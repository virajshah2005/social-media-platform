import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-social-card',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-social-card',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-social-card',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-social-card'
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className={clsx('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={clsx(
            'absolute z-50 px-3 py-2 text-sm text-white bg-social-card border border-social-border rounded-lg shadow-lg whitespace-nowrap',
            positionClasses[position]
          )}
        >
          {content}
          <div
            className={clsx(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip; 