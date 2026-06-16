'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WordPullUpProps {
  words: string;
  className?: string;
  wordClassName?: string;
  delayMultiple?: number;
}

export function WordPullUp({
  words,
  className,
  wordClassName,
  delayMultiple = 0.12,
}: WordPullUpProps) {
  const pullupVariant = {
    initial: { y: 100, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * delayMultiple,
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    }),
  };

  return (
    <div className={cn('flex flex-wrap justify-center gap-x-3', className)}>
      {words.split(' ').map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={pullupVariant}
          initial="initial"
          animate="animate"
          custom={i}
          className={cn('leading-[1.1] tracking-tighter', wordClassName)}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
