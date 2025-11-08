'use client';

import { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLightSystem, setIsLightSystem] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Detect system theme and set cursor color
    // Requirements:
    // - Light system theme → cursor must be WHITE
    // - Dark system theme → cursor must be WHITE
    // Both use white cursor which appears white on dark UI via mix-blend-mode: difference
    const updateCursorColor = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsLightSystem(!prefersDark);
      // Always use white cursor - appears white on dark UI via difference mode
      const cursorColor = '#ffffff';
      document.documentElement.style.setProperty('--cursor-color', cursorColor);
    };

    // Set initial cursor color
    updateCursorColor();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => updateCursorColor();
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleThemeChange);
    }

    // Only show custom cursor on desktop devices with mouse
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsDesktop(hasMouse);
    
    if (!hasMouse) return;

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
    };
  }, []);

  useEffect(() => {
    // Only run cursor tracking if desktop
    if (!isDesktop) return;
    
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
  }, [isDesktop]);

  if (!isVisible || !isDesktop) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        className={`custom-cursor ${isHovering ? 'cursor-hover' : ''} ${isLightSystem ? 'cursor-light-system' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isHovering ? 'ring-hover' : ''} ${isLightSystem ? 'cursor-light-system' : ''}`}
        style={{
          left: `${ringPosition.x}px`,
          top: `${ringPosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}

