import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-3 ${className}`}>
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      {message && <p className="text-sm font-medium text-slate-400">{message}</p>}
    </div>
  );
}
