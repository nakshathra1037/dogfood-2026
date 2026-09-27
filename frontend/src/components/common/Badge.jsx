import React from 'react';

const badgeVariants = {
  success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
  warning: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  danger: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
  info: 'bg-sky-950/60 text-sky-400 border-sky-800/50',
  purple: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
  indigo: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50',
  neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
};

const pulseColors = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-sky-400',
  purple: 'bg-purple-400',
  indigo: 'bg-indigo-400',
  neutral: 'bg-slate-400',
};

export default function Badge({
  children,
  variant = 'neutral',
  pulse = false,
  className = '',
  icon: Icon,
}) {
  const variantStyle = badgeVariants[variant] || badgeVariants.neutral;
  const pulseStyle = pulseColors[variant] || pulseColors.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyle} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseStyle}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseStyle}`} />
        </span>
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
