import { useEffect, useRef, useCallback } from 'react';

/**
 * useVideoGateTimer — Triggers content reveal when video reaches a specific time.
 * 
 * Uses `plyr.currentTime` directly — this is the VIDEO position, not wall-clock time.
 * Works correctly at any playback speed (1x, 1.5x, 2x, etc.) and with seeks.
 * Checks every 2 seconds while playing + on pause/ended events.
 */
export function useVideoGateTimer(
  revealSeconds: number,
  slug: string,
  onReveal: () => void
) {
  const plyrRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const revealedRef = useRef(false);

  // Check if already revealed in localStorage
  const alreadyRevealed = typeof window !== 'undefined' && localStorage.getItem(`ozi_revealed_${slug}`) === '1';

  const checkTime = useCallback(() => {
    if (revealedRef.current) return;
    const plyr = plyrRef.current;
    if (!plyr) return;

    try {
      const currentTime = plyr.currentTime || 0;

      // Simple threshold: if video position >= gate time, reveal
      if (currentTime >= revealSeconds) {
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
    // Check every 2 seconds for responsive feel
    intervalRef.current = window.setInterval(checkTime, 2000);
  }, [checkTime]);

  const attachGateTimer = useCallback((plyr: any) => {
    if (alreadyRevealed || revealSeconds <= 0) return; // No gate needed
    plyrRef.current = plyr;

    plyr.on('playing', () => {
      startInterval();
    });
    plyr.on('pause', () => {
      checkTime(); // Check on pause too
    });
    plyr.on('ended', () => {
      checkTime(); // Final check
    });
    // Also check on seek (timeupdate fires frequently)
    plyr.on('seeked', () => {
      checkTime();
    });

    // If already playing
    if (plyr.playing) {
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
