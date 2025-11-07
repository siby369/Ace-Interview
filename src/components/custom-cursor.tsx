'use client';

import { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Only show custom cursor on desktop devices with mouse
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsDesktop(hasMouse);
    
    if (!hasMouse) return;
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const updateCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setPosition({ x: mouseX, y: mouseY });
    };

    const animateRing = () => {
      // Smooth follow animation for the ring
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      setRingPosition({ x: ringX, y: ringY });

      animationFrameRef.current = requestAnimationFrame(animateRing);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.style.cursor === 'pointer' ||
        window.getComputedStyle(target).cursor === 'pointer';
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isVisible || !isDesktop) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        className={`custom-cursor ${isHovering ? 'cursor-hover' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isHovering ? 'ring-hover' : ''}`}
        style={{
          left: `${ringPosition.x}px`,
          top: `${ringPosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}

