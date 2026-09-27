import React from 'react';
import { Card } from './Card';

export default function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  description,
  accentColor = 'indigo',
}) {
  const iconGradients = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  };

  const selectedGradient = iconGradients[accentColor] || iconGradients.indigo;

  return (
    <Card hoverEffect className="p-5 relative group overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${selectedGradient}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              changeType === 'positive'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                : changeType === 'negative'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          {description}
        </p>
      )}
    </Card>
  );
}
