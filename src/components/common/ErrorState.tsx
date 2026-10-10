import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  technicalDetails?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Processing Anomaly Detected',
  message,
  onRetry,
  technicalDetails
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-rose-900/40 rounded-lg bg-rose-950/20 my-4">
      <div className="w-10 h-10 rounded-lg bg-rose-900/30 border border-rose-800/60 flex items-center justify-center mb-3 text-rose-400">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-200">{title}</h3>
      <p className="mt-1 text-xs text-rose-300/80 max-w-md">{message}</p>
      
      {technicalDetails && (
        <pre className="mt-3 p-2 bg-black/40 border border-rose-900/30 rounded text-[11px] font-mono text-rose-400 max-w-lg overflow-x-auto text-left">
          {technicalDetails}
        </pre>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Parse</span>
        </button>
      )}
    </div>
  );
};
