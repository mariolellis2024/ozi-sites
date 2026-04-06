import { useState, useCallback } from 'react';
import { trackVideoPlay } from '../../hooks/useGA4';

interface YouTubeFacadeProps {
  videoId: string;
  title?: string;
}

export default function YouTubeFacade({ videoId, title = 'Video' }: YouTubeFacadeProps) {
  const [loaded, setLoaded] = useState(false);

  const loadVideo = useCallback(() => {
    setLoaded(true);
    trackVideoPlay(videoId);
  }, [videoId]);

  if (loaded) {
    return (
      <iframe
        className="vsl-player"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={title}
      />
    );
  }

  return (
    <div
      className="vsl-facade"
      role="button"
      tabIndex={0}
      aria-label="Reproduzir vídeo"
      onClick={loadVideo}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          loadVideo();
        }
      }}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        loading="lazy"
        decoding="async"
      />
      <svg className="vsl-play-btn" viewBox="0 0 68 48" width="68" aria-hidden="true">
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
