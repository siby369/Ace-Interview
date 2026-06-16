'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.3,
  duration = 4,
  repeatDelay = 0.5,
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  const numCols = Math.ceil(containerWidth / width) + 1;
  const numRows = Math.ceil(containerHeight / height) + 1;
  const totalSquares = numCols * numRows;

  const squares = Array.from({ length: numSquares }, (_, i) => ({
    id: i,
    pos: [
      Math.floor(Math.random() * numCols),
      Math.floor(Math.random() * numRows),
    ] as [number, number],
  }));

  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-white/[0.03] stroke-white/[0.06]',
        className
      )}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [col, row], id: squareId }) => (
          <motion.rect
            key={`${col}-${row}-${squareId}`}
            width={width - 1}
            height={height - 1}
            x={col * width + 1}
            y={row * height + 1}
            fill="currentColor"
            strokeWidth="0"
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: Infinity,
              delay: Math.random() * duration,
              repeatType: 'reverse',
              repeatDelay,
            }}
          />
        ))}
      </svg>
    </svg>
  );
}
