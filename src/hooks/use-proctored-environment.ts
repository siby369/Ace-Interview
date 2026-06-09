import { useEffect, useState, useCallback } from 'react';

export function useProctoredEnvironment() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const requestFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      }
      setHasStarted(true);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  }, []);

  useEffect(() => {
    // We only actively punish/log if they have actually started the interview
    if (!hasStarted) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setFocusLossCount((prev) => prev + 1);
        console.warn('User switched tabs or minimized the window.');
      }
    };

    const handleBlur = () => {
      setFocusLossCount((prev) => prev + 1);
      console.warn('Window lost focus.');
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block common developer shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || // Mac equivalent
        (e.metaKey && e.key === 'U') // Mac equivalent
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Initial check in case it changed before the listener was attached
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStarted]);

  return { 
    isFullscreen, 
    focusLossCount, 
    requestFullscreen, 
    hasStarted 
  };
}
