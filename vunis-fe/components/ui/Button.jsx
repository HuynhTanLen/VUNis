import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white focus:ring-accent/40',
    secondary: 'bg-surface hover:bg-black/[0.02] text-ink border border-border focus:ring-accent/20',
    ghost: 'text-sub hover:text-ink hover:bg-accent-soft focus:ring-accent/20',
    danger: 'border border-danger/30 text-danger hover:bg-danger-soft focus:ring-danger/20'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-xs rounded-lg font-semibold',
    lg: 'px-5 py-2.5 text-sm rounded-lg font-semibold'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}
