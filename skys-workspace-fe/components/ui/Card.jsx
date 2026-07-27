import React from 'react';

/**
 * @component Card
 * @description Component Thẻ Container chuẩn SaaS Enterprise.
 */
export default function Card({
  children,
  className = '',
  hoverable = true,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
