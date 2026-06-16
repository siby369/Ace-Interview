import React from 'react';

export function SafariMockup({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] bg-[#0A0A0A] ${className}`}>
      {/* Safari Chrome (Titlebar) */}
      <div className="h-10 bg-[#1C1C1E] border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="h-6 w-1/2 max-w-[300px] bg-black/40 rounded-md border border-white/5 flex items-center justify-center">
            <span className="text-[10px] text-white/40 font-medium tracking-wide">aceinterview.ai</span>
          </div>
        </div>
        <div className="w-16" /> {/* Spacer for symmetry */}
      </div>
      {/* Safari Content Window */}
      <div className="relative w-full bg-[#050505]">
        {children}
      </div>
    </div>
  );
}
