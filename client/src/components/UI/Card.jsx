import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'rounded-xl border border-social-border';
  
  const variants = {
    default: 'bg-social-card',
    elevated: 'bg-social-card shadow-lg',
    outlined: 'bg-transparent border-2',
    flat: 'bg-social-background border-0'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    paddingClasses[padding],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card; 