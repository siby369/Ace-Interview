"use client"

export function GradientBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Subtle warm cream aura at the top left */}
      <div 
        className="absolute top-[-15%] left-[-15%] w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] rounded-full blur-[150px] opacity-[0.06]" 
        style={{ background: 'radial-gradient(circle, #E1E0CC 0%, transparent 70%)' }}
      />
      {/* Subtle secondary aura at the bottom right */}
      <div 
        className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full blur-[150px] opacity-[0.03]" 
        style={{ background: 'radial-gradient(circle, #E1E0CC 0%, transparent 70%)' }}
      />
    </div>
  )
}
