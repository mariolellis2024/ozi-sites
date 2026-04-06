import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
// @ts-ignore — plyr usa `export =` que o TS não aceita como default import
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { trackVideoPlay } from '../../hooks/useGA4';

const YT_THUMB_QUALITIES = ['maxresdefault', 'sddefault', 'hqdefault'] as const;

interface PlyrYouTubePlayerProps {
  videoId: string;
  title?: string;
  /** Custom thumbnail URL. Falls back to YouTube auto-thumbnail if not provided */
  thumbnail?: string;
}

export default function PlyrYouTubePlayer({ videoId, title = 'Vídeo', thumbnail }: PlyrYouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);
  const [phase, setPhase] = useState<'thumbnail' | 'playing' | 'ended'>('thumbnail');
  const [thumbUrl, setThumbUrl] = useState('');
  const [thumbIdx, setThumbIdx] = useState(0);

  // Resolve thumbnail: custom > YouTube max quality > fallbacks
  useEffect(() => {
    if (thumbnail) {
      setThumbUrl(thumbnail);
    } else if (videoId) {
      setThumbIdx(0);
      setThumbUrl(`https://img.youtube.com/vi/${videoId}/${YT_THUMB_QUALITIES[0]}.jpg`);
    }
  }, [videoId, thumbnail]);

  const handleThumbError = useCallback(() => {
    if (thumbnail && thumbUrl === thumbnail) {
      setThumbIdx(0);
      setThumbUrl(`https://img.youtube.com/vi/${videoId}/${YT_THUMB_QUALITIES[0]}.jpg`);
      return;
    }
    const next = thumbIdx + 1;
    if (next < YT_THUMB_QUALITIES.length) {
      setThumbIdx(next);
      setThumbUrl(`https://img.youtube.com/vi/${videoId}/${YT_THUMB_QUALITIES[next]}.jpg`);
    }
  }, [thumbIdx, videoId, thumbnail, thumbUrl]);

  // Initialize Plyr when user clicks play
  useEffect(() => {
    if (phase !== 'playing' || !containerRef.current) return;

    const wrapper = containerRef.current;
    wrapper.innerHTML = '';
    const embedDiv = document.createElement('div');
    embedDiv.setAttribute('data-plyr-provider', 'youtube');
    embedDiv.setAttribute('data-plyr-embed-id', videoId);
    wrapper.appendChild(embedDiv);

    const plyr = new Plyr(embedDiv, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'fullscreen',
      ],
      settings: ['speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      autoplay: true,
      storage: { enabled: false },
      youtube: {
        noCookie: false,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        customControls: true,
        controls: 0,
      },
      tooltips: { controls: true, seek: true },
      keyboard: { focused: true, global: true },
      invertTime: false,
    });

    plyr.on('ready', () => {
      try { plyr.speed = 1; } catch { /* noop */ }
    });

    plyr.on('ended', () => {
      try { plyr.destroy(); } catch { /* noop */ }
      plyrRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
      setPhase('ended');
    });

    plyrRef.current = plyr;
    trackVideoPlay(videoId);

    return () => {
      try { plyr.destroy(); } catch { /* noop */ }
      plyrRef.current = null;
    };
  }, [phase, videoId]);

  const handlePlay = useCallback(() => {
    setPhase('playing');
  }, []);

  const handleReplay = useCallback(() => {
    setPhase('playing');
  }, []);

  // Thumbnail state
  if (phase === 'thumbnail') {
    return (
      <div
        className="plyr-thumbnail"
        role="button"
        tabIndex={0}
        aria-label={`Reproduzir ${title}`}
        onClick={handlePlay}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlay(); } }}
      >
        <img
          src={thumbUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={handleThumbError}
        />
        <svg className="plyr-play-btn" viewBox="0 0 68 48" width="68" aria-hidden="true">
          <path
            d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
            fill="#212121"
            fillOpacity="0.8"
          />
          <path d="M45 24L27 14v20" fill="#fff" />
        </svg>
      </div>
    );
  }

  // Ended state — replay overlay
  if (phase === 'ended') {
    return (
      <div className="plyr-ended-overlay">
        <img
          src={thumbUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          className="plyr-ended-bg"
        />
        <div className="plyr-ended-content">
          <button className="plyr-replay-btn" onClick={handleReplay}>
            <RotateCcw size={24} />
            <span>Assistir novamente</span>
          </button>
        </div>
      </div>
    );
  }

  // Playing state — Plyr mounts here
  // The zoom CSS mechanism (padding-bottom:240% + translateY) handles hiding
  // YouTube branding in ALL states (playing, paused, stopped).
  // Plyr controls sit above with z-index:3.
  return <div ref={containerRef} className="plyr-yt-wrap" />;
}
