'use client';

import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface DockProps {
  className?: string;
  children: React.ReactNode;
  magnification?: number;
  distance?: number;
  direction?: 'top' | 'bottom';
}

const DOCK_HEIGHT = 68;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

export const Dock = ({
  className,
  children,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  direction = 'bottom',
}: DockProps) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      style={{ height: DOCK_HEIGHT }}
      className={cn(
        'mx-auto flex w-max items-end gap-4 rounded-2xl px-4 pb-3',
        'bg-white/10 backdrop-blur-2xl border border-white/20',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {Array.isArray(children)
        ? children.map((child: React.ReactNode) =>
            child && typeof child === 'object' && 'props' in child
              ? { ...child, props: { ...child.props, mouseX, magnification, distance } }
              : child
          )
        : children}
    </motion.div>
  );
};

export interface DockIconProps {
  size?: number;
  magnification?: number;
  distance?: number;
  mouseX?: ReturnType<typeof useMotionValue<number>>;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export const DockIcon = ({
  size,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  children,
  ...rest
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const distanceCalc = useTransform(mouseX ?? useMotionValue(Infinity), (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [40, magnification, 40]
  );
  const scaleSize = useSpring(sizeTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width: scaleSize, height: scaleSize }}
      className={cn(
        'flex aspect-square cursor-pointer items-center justify-center rounded-full',
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
