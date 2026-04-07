import { useEffect, useRef, useCallback } from 'react';

/**
 * useVideoGateTimer — Tracks video playback time and triggers content reveal.
 * 
 * Uses Plyr's `currentTime` to measure ACTUAL watch time (respects 2x speed, pause, seeks).
 * Checks every 5 seconds. When accumulated watched time >= revealSeconds, calls onReveal().
 * 
 * Does NOT interfere with useVideoRetention — both attach independently to the same Plyr instance.
 */
export function useVideoGateTimer(
  revealSeconds: number,
  slug: string,
  onReveal: () => void
) {
  const plyrRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const revealedRef = useRef(false);

  // Check if already revealed in localStorage
  const alreadyRevealed = typeof window !== 'undefined' && localStorage.getItem(`ozi_revealed_${slug}`) === '1';

  const checkTime = useCallback(() => {
    if (revealedRef.current) return;
    const plyr = plyrRef.current;
    if (!plyr) return;

    try {
      const currentTime = plyr.currentTime || 0;
      const playing = plyr.playing;

      if (playing && lastTimeRef.current > 0) {
        // Calculate delta from last check
        const delta = currentTime - lastTimeRef.current;
        // Only accumulate if forward progress (skip backward seeks)
        if (delta > 0 && delta < 15) {
          accumulatedRef.current += delta;
        }
      }
      lastTimeRef.current = currentTime;

      // Check if threshold reached
      if (accumulatedRef.current >= revealSeconds) {
        revealedRef.current = true;
        if (slug) localStorage.setItem(`ozi_revealed_${slug}`, '1');
        onReveal();
        // Stop checking
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch { /* player may be destroyed */ }
  }, [revealSeconds, slug, onReveal]);

  const startInterval = useCallback(() => {
    if (intervalRef.current || revealedRef.current) return;
    intervalRef.current = window.setInterval(checkTime, 5000);
  }, [checkTime]);

  const attachGateTimer = useCallback((plyr: any) => {
    if (alreadyRevealed || revealSeconds <= 0) return; // No gate needed
    plyrRef.current = plyr;

    plyr.on('playing', () => {
      lastTimeRef.current = plyr.currentTime || 0;
      startInterval();
    });
    plyr.on('pause', () => {
      checkTime(); // Record final delta
    });
    plyr.on('ended', () => {
      checkTime(); // Final check
    });

    // If already playing
    if (plyr.playing) {
      lastTimeRef.current = plyr.currentTime || 0;
      startInterval();
    }
  }, [alreadyRevealed, revealSeconds, startInterval, checkTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { attachGateTimer };
}
