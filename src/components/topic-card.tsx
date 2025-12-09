'use client';

import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { DifficultySelector } from './difficulty-selector';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/utils';

interface TopicCardProps {
    topic: string;
    subTopicCount: number;
    isSelected: boolean;
    difficulty: string;
    onSelect: (checked: boolean) => void;
    onDifficultyChange: (difficulty: string) => void;
}

export function TopicCard({
    topic,
    subTopicCount,
    isSelected,
    difficulty,
    onSelect,
    onDifficultyChange,
}: TopicCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set(clientX - left - width / 2);
        y.set(clientY - top - height / 2);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    // 3D Transforms
    const rotateX = useMotionTemplate`${mouseY}deg`; // Simplified for direct mapping, likely need division
    const rotateY = useMotionTemplate`${mouseX}deg`;

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                transformStyle: 'preserve-3d',
                rotateX: useMotionTemplate`${useSpring(y.get() / 20, { stiffness: 200, damping: 20 })}deg`,
                rotateY: useMotionTemplate`${useSpring(x.get() / -20, { stiffness: 200, damping: 20 })}deg`,
            }}
            className={cn(
                "group relative rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20",
                isSelected && "border-primary/50 bg-primary/5 hover:border-primary/60"
            )}
            onClick={() => onSelect(!isSelected)}
        >
            {/* Background Gradient Hover Effect */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Selected Glow */}
            {isSelected && (
                <motion.div
                    layoutId={`glow-${slugify(topic)}`}
                    className="absolute inset-0 -z-20 rounded-xl bg-primary/10 blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}

            <div className="flex flex-col gap-4" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/30 transition-all",
                                isSelected ? "bg-primary border-primary text-black" : "bg-transparent text-transparent"
                            )}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-tight">{topic}</h3>
                            <p className="text-xs text-white/50 mt-1">{subTopicCount} Sub-topics</p>
                        </div>
                    </div>
                </div>

                {/* Expandable Difficulty Selector */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={cn("transition-all duration-300 overflow-hidden", isSelected ? "max-h-20 opacity-100" : "max-h-0 opacity-0")}
                >
                    <div className="pt-2">
                        <DifficultySelector
                            value={difficulty}
                            onChange={onDifficultyChange}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
