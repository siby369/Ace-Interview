import React from 'react';
import { cn } from '@/lib/utils';

interface SafariProps {
  url?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Safari({ url = 'aceinterview.ai', className, children }: SafariProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414]',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_80px_-20px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {/* Safari Chrome */}
      <div className="flex h-10 items-center gap-3 border-b border-white/[0.06] bg-[#1a1a1a] px-4">
        {/* Traffic Lights */}
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-[#FF5F56] shadow-[0_0_0_0.5px_rgba(0,0,0,0.3)]" />
          <div className="size-3 rounded-full bg-[#FEBC2E] shadow-[0_0_0_0.5px_rgba(0,0,0,0.3)]" />
          <div className="size-3 rounded-full bg-[#28C840] shadow-[0_0_0_0.5px_rgba(0,0,0,0.3)]" />
        </div>
        {/* URL Bar */}
        <div className="flex flex-1 justify-center">
          <div className="flex h-6 w-2/5 items-center justify-center gap-1 rounded-md bg-black/40 px-3">
            <svg
              className="size-3 shrink-0 text-white/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="truncate text-[11px] font-medium text-white/40">{url}</span>
          </div>
        </div>
        {/* Spacer */}
        <div className="w-12" />
      </div>

      {/* Browser Content */}
      <div className="bg-[#0e0e0e]">{children}</div>
    </div>
  );
}
