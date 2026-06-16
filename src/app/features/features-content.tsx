'use client';

import { motion } from 'framer-motion';
import { Mic, Trophy, Zap, Briefcase, Cpu, Sparkles, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'AI-Powered Interviews',
    description: 'Dynamic question generation using advanced LLMs that adapt to your role, difficulty level, and responses in real-time. No two interviews are ever the same.',
    icon: Cpu,
    className: "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/5 to-transparent",
    iconClassName: "text-[#E1E0CC]",
    large: true,
  },
  {
    title: 'Pronunciation Scoring',
    description: 'Detailed, actionable feedback on speech clarity, pacing, and accuracy.',
    icon: Trophy,
    className: "col-span-1",
    iconClassName: "text-[#E1E0CC]",
  },
  {
    title: 'Real-Time Audio',
    description: 'Flawless voice recording and AI-driven analysis.',
    icon: Mic,
    className: "col-span-1",
    iconClassName: "text-white/70",
  },
  {
    title: 'Role-Based Tracks',
    description: 'Specialized paths designed for SWE, PM, UX, and more.',
    icon: Briefcase,
    className: "col-span-1",
    iconClassName: "text-white/70",
  },
  {
    title: 'Lightning Fast',
    description: 'Built on Next.js 15 for an incredibly fluid, responsive experience with zero lag.',
    icon: Zap,
    className: "md:col-span-2 lg:col-span-1 bg-gradient-to-bl from-white/5 to-transparent",
    iconClassName: "text-[#E1E0CC]",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 20 } },
};

export default function FeaturesContent() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center">
      <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 text-[#E1E0CC]" />
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Apple HIG Inspired</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl text-white"
        >
          Everything to <br className="hidden md:block" />
          <span className="text-[#E1E0CC]">master the interview.</span>
        </motion.h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40 p-8 sm:p-10 backdrop-blur-2xl transition-all duration-500 hover:border-white/30 hover:bg-white/[0.08] flex flex-col justify-between min-h-[280px]",
                feature.className
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative z-10 flex-1">
                <div className={cn(
                  "mb-8 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/20",
                  feature.large ? "h-16 w-16" : "h-12 w-12"
                )}>
                  <Icon className={cn("h-6 w-6", feature.iconClassName)} />
                </div>
                <h3 className={cn("font-medium text-white mb-4 tracking-tight", feature.large ? "text-3xl md:text-4xl" : "text-xl md:text-2xl")}>
                  {feature.title}
                </h3>
              </div>
              
              <div className="relative z-10 mt-4">
                <p className={cn("leading-relaxed text-white/60 font-medium", feature.large ? "text-lg max-w-md" : "text-sm")}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
