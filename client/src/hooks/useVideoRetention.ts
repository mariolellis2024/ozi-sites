import { useEffect, useRef, useCallback } from 'react';

/**
 * Tracks video retention segments and sends them to the backend.
 * Adapted from Alanis's useVideoProgress but for anonymous visitors (SCK-based).
 *
 * Records which percentage-based segments (0-99) the viewer watches.
 * Flushes data every 30s, and on pause/ended/page-exit.
 */
export function useVideoRetention(slug: string, videoId: string) {
  const segmentsRef = useRef<Set<number>>(new Set());
  const heartbeatRef = useRef<number | null>(null);
  const plyrRef = useRef<any>(null);
  const activeRef = useRef(false);
  const lastSegmentRef = useRef<number>(-1);

  /** Get SCK from cookies */
  const getSck = useCallback((): string | null => {
    const match = document.cookie.match(/(?:^|; )_sck=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }, []);

  /** Record current playback position as a segment 0-99.
   *  Fills ALL segments from last recorded position to current,
   *  so continuous playback produces a smooth retention curve. */
  const recordSegment = useCallback(() => {
    const plyr = plyrRef.current;
    if (!plyr) return;
    try {
      const duration = plyr.duration;
      const currentTime = plyr.currentTime;
      if (!duration || duration <= 0 || currentTime < 0) return;
      const currentSeg = Math.min(99, Math.floor((currentTime / duration) * 100));

      // Fill from (lastSegment + 1) to currentSegment inclusive
      const start = lastSegmentRef.current < 0 ? 0 : lastSegmentRef.current;
      for (let i = start; i <= currentSeg; i++) {
        segmentsRef.current.add(i);
      }
      lastSegmentRef.current = currentSeg;
    } catch { /* ignore destroyed player */ }
  }, []);

  /** Send accumulated segments to the backend (fire-and-forget) */
  const flush = useCallback(() => {
    if (segmentsRef.current.size === 0) return;
    const sck = getSck();
    if (!sck) return;

    const duration = plyrRef.current?.duration || 0;
    if (duration <= 0) return;

    const segArray = Array.from(segmentsRef.current);
    segmentsRef.current.clear();

    fetch('/api/retention/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, videoId, segments: segArray, duration, sck }),
    }).catch(() => { /* fire-and-forget */ });
  }, [slug, videoId, getSck]);

  /** Start the heartbeat interval (10s record, flush every 3 ticks = 30s) */
  const startTracking = useCallback(() => {
    if (heartbeatRef.current || activeRef.current) return;
    activeRef.current = true;
    let tickCount = 0;

    heartbeatRef.current = window.setInterval(() => {
      recordSegment();
      tickCount++;
      if (tickCount >= 3) {
        tickCount = 0;
        flush();
      }
    }, 10000);
  }, [recordSegment, flush]);

  /** Stop the heartbeat */
  const stopTracking = useCallback(() => {
    if (heartbeatRef.current) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    activeRef.current = false;
    // Record final segment + flush
    recordSegment();
    flush();
  }, [recordSegment, flush]);

  /** Attach to a Plyr instance */
  const attachPlayer = useCallback((plyr: any) => {
    plyrRef.current = plyr;
    lastSegmentRef.current = -1; // Reset for new playback session

    plyr.on('playing', () => startTracking());
    plyr.on('pause', () => {
      recordSegment();
      flush();
    });
    plyr.on('ended', () => stopTracking());

    // If player is already playing (autoplay), start tracking now
    if (plyr.playing) {
      startTracking();
    }
  }, [startTracking, stopTracking, recordSegment, flush]);

  /** Flush on page exit (beforeunload) */
  useEffect(() => {
    const handleBeforeUnload = () => {
      recordSegment();
      // Use sendBeacon for reliable delivery on page exit
      const sck = getSck();
      const duration = plyrRef.current?.duration || 0;
      if (!sck || segmentsRef.current.size === 0 || duration <= 0) return;

      const payload = JSON.stringify({
        slug, videoId,
        segments: Array.from(segmentsRef.current),
        duration, sck,
      });
      navigator.sendBeacon('/api/retention/track', new Blob([payload], { type: 'application/json' }));
      segmentsRef.current.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopTracking();
    };
  }, [slug, videoId, getSck, recordSegment, stopTracking]);

  return { attachPlayer, plyrRef };
}
