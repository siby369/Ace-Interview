'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Mic, 
  Activity, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck,
  Volume2,
  Check,
  Sliders,
  Sparkles
} from 'lucide-react';

const steps = [
  {
    id: 0,
    number: '01',
    title: 'Define the Parameters',
    subtitle: 'Set target role and topics',
    description: 'Specify your target position manually or by uploading a Job Description document. Refine technical focus areas to align with your mock interview goals.',
    badge: 'Setup',
    icon: Sliders,
    borderColor: 'border-[#E1E0CC]/20',
    accentColor: '#E1E0CC'
  },
  {
    id: 1,
    number: '02',
    title: 'Conduct the Interview',
    subtitle: 'Real-time voice practice',
    description: 'Respond naturally over real-time audio. The interface handles voice transcription dynamically, pacing follow-up questions based on your technical depth.',
    badge: 'Session',
    icon: Mic,
    borderColor: 'border-[#E1E0CC]/20',
    accentColor: '#E1E0CC'
  },
  {
    id: 2,
    number: '03',
    title: 'Review the Evaluation',
    subtitle: 'Structured feedback metrics',
    description: 'Analyze a structural breakdown of your answers. View granular scores on technical correctness, STAR model structuring, and phrasing optimization.',
    badge: 'Feedback',
    icon: Activity,
    borderColor: 'border-[#E1E0CC]/20',
    accentColor: '#E1E0CC'
  },
  {
    id: 3,
    number: '04',
    title: 'Track Refinement',
    subtitle: 'Mastery and progression history',
    description: 'Compare transcripts and progression indicators across sessions. Track filler-word reduction and skill mastery trends to gauge readiness.',
    badge: 'Analytics',
    icon: RefreshCw,
    borderColor: 'border-[#E1E0CC]/20',
    accentColor: '#E1E0CC'
  }
];

export default function HowItWorksContent() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance mechanism
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#E1E0CC] selection:bg-white/10 relative overflow-hidden">
      <main className="w-full max-w-6xl mx-auto px-6 pt-32 pb-40 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E1E0CC]/50" />
            <span className="text-[10px] font-mono tracking-widest text-[#E1E0CC]/50 uppercase">workflow overview</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-[#E1E0CC] mb-6 leading-[0.95]" style={{ letterSpacing: "-0.05em" }}>
            How it works.
          </h1>
          <p className="text-[#E1E0CC]/50 text-lg md:text-xl max-w-2xl leading-relaxed">
            We deconstructed the technical interviewing process into a clean, four-stage feedback loop designed for systematic preparation.
          </p>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Menu / Steps List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between h-full">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsPlaying(false); // Pause auto-advancing on user click
                  }}
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 relative group flex items-start gap-5 ${
                    isActive 
                      ? 'bg-white/[0.03] border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.6)]' 
                      : 'bg-transparent border-transparent hover:bg-white/[0.01] hover:border-white/5'
                  }`}
                >
                  {/* Indicator bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator" 
                      className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[#E1E0CC]" 
                    />
                  )}

                  {/* Step Icon Badge */}
                  <div 
                    className={`p-3 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-white/5 border-white/15 text-[#E1E0CC]' 
                        : 'bg-white/[0.01] border-white/5 text-[#E1E0CC]/30 group-hover:border-white/10 group-hover:text-[#E1E0CC]/50'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono opacity-30">{step.number}</span>
                      <span 
                        className={`text-[9px] uppercase tracking-widest font-mono font-semibold px-2 py-0.5 rounded-full border transition-all ${
                          isActive 
                            ? 'bg-white/5 text-[#E1E0CC] border-white/15' 
                            : 'bg-transparent text-[#E1E0CC]/20 border-transparent'
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                    <h3 className={`font-semibold text-lg transition-colors ${isActive ? 'text-[#E1E0CC]' : 'text-[#E1E0CC]/40 group-hover:text-[#E1E0CC]/70'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 leading-relaxed transition-opacity duration-300 ${isActive ? 'text-[#E1E0CC]/60' : 'text-[#E1E0CC]/20 group-hover:text-[#E1E0CC]/40'}`}>
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Showcase Box (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            
            {/* Interactive Visual Sandbox */}
            <div className="w-full bg-[#0b0b0b] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[460px] h-full">
              
              {/* Box Top Panel decor */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="text-[10px] font-mono text-[#E1E0CC]/40 ml-2 uppercase tracking-widest">
                    SYSTEM PREVIEW
                  </span>
                </div>
                
                {/* Auto Play controller */}
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[9px] hover:bg-white/10 transition-colors font-mono tracking-wider flex items-center gap-1.5"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#E1E0CC] animate-pulse' : 'bg-white/10'}`} />
                  {isPlaying ? 'PAUSE WALKTHROUGH' : 'PLAY'}
                </button>
              </div>

              {/* Dynamic Interactive Renderings */}
              <div className="flex-1 flex items-center justify-center my-6 relative overflow-hidden min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.98, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -5 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {activeStep === 0 && <ConfigureSandboxMockup />}
                    {activeStep === 1 && <AudioSandboxMockup />}
                    {activeStep === 2 && <FeedbackSandboxMockup />}
                    {activeStep === 3 && <IterateSandboxMockup />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Box Info Footer */}
              <div className="border-t border-white/5 pt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-sm leading-relaxed text-[#E1E0CC]/80">
                      {steps[activeStep].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Quick Action Banner */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#E1E0CC]/60" />
                <span className="text-xs text-[#E1E0CC]/50">
                  Ready to test your abilities? Starts setup-free.
                </span>
              </div>
              <a 
                href="/interview/new" 
                className="text-xs font-semibold text-[#E1E0CC] flex items-center gap-1 hover:gap-1.5 transition-all group"
              >
                Launch Mock Session
                <ChevronRight className="w-4 h-4 text-[#E1E0CC]/70 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Sandbox Mockups Rendering
// ────────────────────────────────────────────────────────────────────────

// 01: Configure Target
function ConfigureSandboxMockup() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white/[0.02] border border-white/5 p-5 shadow-xl flex flex-col gap-4 font-mono text-xs">
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] uppercase tracking-widest text-[#E1E0CC]/40 font-semibold">Job Title</label>
        <div className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-[#E1E0CC] flex items-center justify-between">
          <span>Senior Systems Engineer</span>
          <Sliders className="w-3.5 h-3.5 text-[#E1E0CC]/40" />
        </div>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] uppercase tracking-widest text-[#E1E0CC]/40 font-semibold">Focus Areas</label>
        <div className="flex flex-wrap gap-2">
          {['Scalability', 'CAP Theorem', 'Redis Cache', 'gRPC'].map((tech, i) => (
            <motion.span 
              key={tech}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[#E1E0CC]/80 font-semibold text-[10px]"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] uppercase tracking-widest text-[#E1E0CC]/40 font-semibold">Interviewer Persona</label>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded bg-[#E1E0CC] text-black font-semibold text-[10px]">Strict Lead</span>
          <span className="px-3 py-1.5 rounded bg-white/5 text-[#E1E0CC]/50 border border-white/5 text-[10px]">Friendly Peer</span>
        </div>
      </div>
    </div>
  );
}

// 02: Live Audio Session
function AudioSandboxMockup() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const int = setInterval(() => {
      setPulse(p => !p);
    }, 1500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center gap-6">
      
      {/* Pulsing Mic Ring Group */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <motion.div 
          animate={{ scale: pulse ? 1.3 : 1, opacity: pulse ? 0 : 0.2 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border border-white/20"
        />
        <motion.div 
          animate={{ scale: pulse ? 1.6 : 1, opacity: pulse ? 0 : 0.1 }}
          transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border border-white/10"
        />
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shadow-lg border border-white/20 z-10">
          <Mic className="w-5 h-5 text-[#E1E0CC]" />
        </div>
      </div>

      {/* Real-time wave and transcription mimic */}
      <div className="w-full flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.01] font-mono text-xs">
        <div className="flex gap-2 items-center text-[9px] text-[#E1E0CC]/50 font-semibold uppercase tracking-widest mb-1">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Real-time Audio Transcript</span>
        </div>
        <p className="text-[#E1E0CC]/80 italic">
          "How does a write-back cache impact database integrity?"
        </p>
      </div>

    </div>
  );
}

// 03: FAANG-Level Feedback
function FeedbackSandboxMockup() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white/[0.02] border border-white/5 p-5 shadow-xl flex flex-col gap-5 text-xs font-mono">
      
      {/* Score and summary header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[#E1E0CC]/90">Evaluation Overview</h4>
          <p className="text-[9px] text-[#E1E0CC]/40">Attempt #2 Feedback</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#E1E0CC] font-bold">
          <Check className="w-3 h-3 text-[#E1E0CC]/70" />
          <span>82 / 100</span>
        </div>
      </div>

      {/* Structured stats */}
      <div className="flex flex-col gap-3">
        
        {/* Technical Accuracy progress block */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-[#E1E0CC]/50 uppercase tracking-widest font-semibold">
            <span>Technical Accuracy</span>
            <span className="text-[#E1E0CC] font-bold">85%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: '85%' }} 
              transition={{ duration: 1 }}
              className="h-full bg-[#E1E0CC]/60" 
            />
          </div>
        </div>

        {/* STAR Structure progress block */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-[#E1E0CC]/50 uppercase tracking-widest font-semibold">
            <span>STAR Model Structure</span>
            <span className="text-[#E1E0CC]/70 font-bold">60%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: '60%' }} 
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-[#E1E0CC]/40" 
            />
          </div>
        </div>

      </div>

      {/* Suggested rewrite diff card */}
      <div className="p-3 rounded-lg border border-white/5 bg-white/[0.01] text-[10px] leading-relaxed">
        <span className="text-[9px] uppercase font-bold text-[#E1E0CC]/40 block mb-1">phrasing recommendation:</span>
        <div className="text-white/30 italic block mb-1">- "I'd check the DB if Cache is empty"</div>
        <div className="text-[#E1E0CC] font-medium">+ "Query the database upon a cache miss, writing back the results to Redis."</div>
      </div>

    </div>
  );
}

// 04: Iterate & Conquer
function IterateSandboxMockup() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white/[0.02] border border-white/5 p-5 shadow-xl flex flex-col gap-5 text-xs font-mono">
      
      {/* Metric details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="text-[9px] text-[#E1E0CC]/40 uppercase tracking-widest font-semibold mb-1">Score Delta</div>
          <div className="text-lg font-bold text-[#E1E0CC]">
            <span>+34%</span>
          </div>
        </div>
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="text-[9px] text-[#E1E0CC]/40 uppercase tracking-widest font-semibold mb-1">Filler Words</div>
          <div className="text-lg font-bold text-[#E1E0CC]/70">
            <span>-65%</span>
          </div>
        </div>
      </div>

      {/* Interactive Line Chart Mock */}
      <div className="relative h-20 w-full mt-2 flex flex-col justify-end">
        
        {/* Sparkles background grid line */}
        <div className="absolute inset-x-0 top-1/2 border-t border-white/5" />
        <div className="absolute inset-x-0 top-0 border-t border-white/5" />

        {/* SVG Drawing of the score progression */}
        <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible z-10">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E1E0CC" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#E1E0CC" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Shaded Area */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
            d="M 5 25 Q 30 18 55 12 T 95 3 L 95 30 L 5 30 Z" 
            fill="url(#chartGrad)" 
          />

          {/* Line */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
            d="M 5 25 Q 30 18 55 12 T 95 3" 
            fill="none" 
            stroke="#E1E0CC" 
            strokeOpacity="0.8"
            strokeWidth="1.2" 
          />

          {/* End indicator circle */}
          <motion.circle 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.3 }}
            cx="95" cy="3" r="1.5" 
            fill="#E1E0CC" 
          />
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[8px] text-[#E1E0CC]/35 font-semibold px-1 mt-2">
          <span>Run 1</span>
          <span>Run 2</span>
          <span>Run 3</span>
          <span>Mastery</span>
        </div>
      </div>

    </div>
  );
}
