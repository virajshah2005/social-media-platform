import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-social-text">
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary">
            <LeftIcon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          className={clsx(
            'w-full px-4 py-2 bg-social-card border border-social-border rounded-lg text-social-text placeholder-social-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        
        {RightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-social-textSecondary">
            <RightIcon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={clsx(
          'text-sm',
          error ? 'text-red-400' : 'text-social-textSecondary'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 