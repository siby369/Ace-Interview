'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DifficultySelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const levels = ['Easy', 'Medium', 'Hard'];

export function DifficultySelector({ value, onChange, disabled }: DifficultySelectorProps) {
    return (
        <div className={cn("flex items-center bg-black/40 rounded-full p-1 border border-white/5", disabled && "opacity-50 pointer-events-none")}>
            {levels.map((level) => {
                const isActive = value === level;
                return (
                    <button
                        key={level}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(level);
                        }}
                        disabled={disabled}
                        className="relative px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:text-white focus:outline-none"
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeDifficulty"
                                className={cn(
                                    "absolute inset-0 rounded-full bg-white/10 border border-white/10",
                                    level === 'Easy' && "bg-green-500/20 border-green-500/30",
                                    level === 'Medium' && "bg-yellow-500/20 border-yellow-500/30",
                                    level === 'Hard' && "bg-red-500/20 border-red-500/30"
                                )}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{level}</span>
                    </button>
                );
            })}
        </div>
    );
}
