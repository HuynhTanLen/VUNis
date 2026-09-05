import React from 'react';

export default function Card({
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`bg-surface rounded-xl border border-border p-5 transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
