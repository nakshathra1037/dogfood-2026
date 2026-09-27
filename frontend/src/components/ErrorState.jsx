import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load requested data. Please try again or check your local server.',
  onRetry,
}) {
  return (
    <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-6">
      <div className="h-12 w-12 rounded-xl bg-rose-900/30 border border-rose-800/50 flex items-center justify-center text-rose-400">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-base font-semibold text-rose-200">{title}</h4>
        <p className="mt-1 text-xs text-rose-300/70 leading-relaxed">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
