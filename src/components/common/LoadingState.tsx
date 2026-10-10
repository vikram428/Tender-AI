import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
  sublabel?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Processing document stream...',
  sublabel = 'Executing deterministic regex and table extraction rules'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center border border-slate-800/80 rounded-lg bg-[#0E1726]/60">
      <div className="relative mb-4">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <div className="absolute inset-0 border border-cyan-400/20 rounded-full scale-150 animate-ping opacity-30" />
      </div>
      <p className="text-sm font-medium text-slate-200">{label}</p>
      <p className="mt-1 text-xs text-slate-400 font-mono">{sublabel}</p>
      
      {/* Skeleton placeholders */}
      <div className="w-full max-w-md mt-6 space-y-2">
        <div className="h-2 bg-slate-800/80 rounded animate-pulse" />
        <div className="h-2 bg-slate-800/60 rounded animate-pulse w-4/5 mx-auto" />
        <div className="h-2 bg-slate-800/40 rounded animate-pulse w-2/3 mx-auto" />
      </div>
    </div>
  );
};
