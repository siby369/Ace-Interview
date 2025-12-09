'use client';

import { motion } from 'framer-motion';

interface FloatingOrbProps {
    delay?: number;
    className?: string;
}

// Floating gradient orb component for depth effect with organic movement
export function FloatingOrb({ delay = 0, className = '' }: FloatingOrbProps) {
    // Add subtle randomness to create organic feel
    const baseDuration = 7.5 + Math.random() * 2.5 + delay;
    const jitterAmount = 2 + Math.random() * 3;

    return (
        <motion.div
            className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
            style={{
                borderRadius: `${45 + Math.random() * 10}%`,
            }}
            animate={{
                y: [0, -25 - jitterAmount, 0],
                x: [0, 15 + Math.random() * 10, 0],
                scale: [1, 1.08 + Math.random() * 0.04, 1],
                opacity: [0.18, 0.22 + Math.random() * 0.03, 0.18],
            }}
            transition={{
                duration: baseDuration,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1], // More organic easing
                times: [0, 0.5, 1],
            }}
        />
    );
}
