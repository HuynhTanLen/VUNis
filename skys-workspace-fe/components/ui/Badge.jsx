import React from 'react';

/**
 * @component Badge
 * @description Component Viên thuốc trạng thái (Soft Badge Pill) chuẩn SaaS Enterprise.
 */
export default function Badge({
  children,
  variant = 'slate',
  size = 'md',
  icon: Icon,
  className = ''
}) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    slate: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variants[variant] || variants.slate} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
