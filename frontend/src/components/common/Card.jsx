import React from 'react';

export function Card({ children, className = '', hoverEffect = false, ...props }) {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl overflow-hidden transition-all duration-200 ${
        hoverEffect ? 'hover:border-slate-700 hover:shadow-slate-900/50 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-5 pb-3 border-b border-slate-800/60 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', icon: Icon }) {
  return (
    <h3 className={`text-lg font-semibold text-slate-100 flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="w-5 h-5 text-indigo-400 shrink-0" />}
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`mt-1 text-sm text-slate-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}
