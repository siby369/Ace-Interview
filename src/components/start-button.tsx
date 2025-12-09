'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StartButtonProps {
    onClick: () => void;
    count: number;
    disabled?: boolean;
}

export function StartButton({ onClick, count, disabled }: StartButtonProps) {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{
                    y: disabled ? 100 : 0,
                    opacity: disabled ? 0 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="pointer-events-auto"
            >
                <Button
                    size="lg"
                    onClick={onClick}
                    className={cn(
                        "relative group h-14 rounded-full px-8 bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]",
                        "border border-white/20 backdrop-blur-md"
                    )}
                >
                    <div className="absolute inset-0 rounded-full border border-white/50 opacity-0 scale-110 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />

                    <span className="flex items-center gap-2 font-bold text-lg">
                        <span>Start Interview</span>
                        <span className="bg-black/10 px-2 py-0.5 rounded-full text-xs font-mono font-medium">
                            {count} selected
                        </span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>

                    {/* Ripple Effect Container */}
                    <div className="absolute inset-0 -z-10 rounded-full overflow-visible">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-20 duration-1000" />
                    </div>
                </Button>
            </motion.div>
        </div>
    );
}
