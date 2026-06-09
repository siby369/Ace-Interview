'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingOrbProps {
    delay?: number;
    className?: string;
}

// Floating gradient orb component for depth effect with organic movement
export function FloatingOrb({ delay = 0, className = '' }: FloatingOrbProps) {
    const [mounted, setMounted] = useState(false);
    const [config, setConfig] = useState({
        borderRadius: '50%',
        duration: 8 + delay,
        jitterX: 20,
        jitterY: 27,
        scale: 1.1,
        opacity: 0.22,
    });

    useEffect(() => {
        const baseDuration = 7.5 + Math.random() * 2.5 + delay;
        const jitterAmount = 2 + Math.random() * 3;
        
        setConfig({
            borderRadius: `${45 + Math.random() * 10}%`,
            duration: baseDuration,
            jitterY: 25 + jitterAmount,
            jitterX: 15 + Math.random() * 10,
            scale: 1.08 + Math.random() * 0.04,
            opacity: 0.22 + Math.random() * 0.03,
        });
        setMounted(true);
    }, [delay]);

    return (
        <motion.div
            className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
            style={{
                borderRadius: config.borderRadius,
            }}
            animate={mounted ? {
                y: [0, -config.jitterY, 0],
                x: [0, config.jitterX, 0],
                scale: [1, config.scale, 1],
                opacity: [0.18, config.opacity, 0.18],
            } : undefined}
            transition={{
                duration: config.duration,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                times: [0, 0.5, 1],
            }}
        />
    );
}
