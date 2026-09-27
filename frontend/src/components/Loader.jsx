import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading content...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-6 text-slate-400 text-xs font-mono">
      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
      <span>{message}</span>
    </div>
  );
}
