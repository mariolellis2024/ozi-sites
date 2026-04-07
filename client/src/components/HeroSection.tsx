import { useState, useCallback, useRef } from 'react';
import { useEdit } from '../context/EditContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import EditableText from './ui/EditableText';
import EditableImage from './ui/EditableImage';
import PlyrYouTubePlayer from './ui/PlyrYouTubePlayer';
import TextEditModal from './ui/TextEditModal';
import { useVideoRetention } from '../hooks/useVideoRetention';
import { useVideoGateTimer } from '../hooks/useVideoGateTimer';
import { Pencil, Image as ImageIcon } from 'lucide-react';

/** Extract YouTube video ID from various URL formats or raw ID */
function extractVideoId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  const shortMatch = trimmed.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch = trimmed.match(/(?:v=|embed\/|shorts\/)([\w-]{11})/);
  if (longMatch) return longMatch[1];
  return trimmed;
}

/**
 * HeroVideoBlock — Clean video block for Página Fechada hero.
 * NO vsl-container class (avoids 80px margin-top from CSS).
 * NO wrapper margin (avoids extra 24px bottom margin).
 * Spacing is 100% controlled by the parent flex gap.
 */
function HeroVideoBlock({ videoId, orientation, thumbnail, isEditing, onChangeVideoId, onChangeOrientation, onChangeThumbnail, onGateTimerAttach }: {
  videoId: string;
  orientation: 'vertical' | 'horizontal';
  thumbnail?: string;
  isEditing: boolean;
  onChangeVideoId: (id: string) => void;
  onChangeOrientation: (o: 'vertical' | 'horizontal') => void;
  onChangeThumbnail: (url: string) => void;
  onGateTimerAttach?: (plyr: any) => void;
}) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const edit = useEdit();

  const slug = window.location.pathname.replace(/^\//, '') || 'home';
  const { attachPlayer } = useVideoRetention(slug, videoId);

  const isVertical = orientation === 'vertical';

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: isVertical ? 400 : 900,
    margin: '0 auto',  // NO bottom margin
    borderRadius: 'var(--radius-medium)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-large), 0 0 40px rgba(117, 251, 198, 0.06)',
    border: '1px solid var(--color-border)',
    aspectRatio: isVertical ? '9 / 16' : '16 / 9',
    transition: 'max-width 0.4s ease, aspect-ratio 0.4s ease',
  };

  const handleVideoSave = useCallback((val: string) => {
    const id = extractVideoId(val);
    if (id) onChangeVideoId(id);
    setShowVideoModal(false);
  }, [onChangeVideoId]);

  const handleThumbnailUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !edit) return;
    try {
      const url = await edit.uploadImage('vsl_thumbnail', file);
      onChangeThumbnail(url);
    } catch (err) {
      console.error('Thumbnail upload failed', err);
    }
  }, [edit, onChangeThumbnail]);

  const toolBtnStyle = (active?: boolean): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
    background: active ? 'rgba(117,251,198,0.25)' : 'rgba(30,30,30,0.85)',
    color: active ? '#75fbc6' : 'rgba(255,255,255,0.8)',
    transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <>
      {/* NO vsl-container class — zero external CSS margins */}
      <div style={{ position: 'relative' }}>
        {isEditing && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <button onClick={() => onChangeOrientation('vertical')} style={toolBtnStyle(isVertical)}>
              📱 Vertical
            </button>
            <button onClick={() => onChangeOrientation('horizontal')} style={toolBtnStyle(!isVertical)}>
              🖥 Horizontal
            </button>
            <button onClick={() => setShowVideoModal(true)} style={toolBtnStyle()}>
              <Pencil size={13} /> Trocar vídeo
            </button>
            <button onClick={() => fileInputRef.current?.click()} style={toolBtnStyle()}>
              <ImageIcon size={13} /> Thumbnail
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbnailUpload}
            />
          </div>
        )}
        <div style={wrapperStyle}>
          <PlyrYouTubePlayer videoId={videoId} thumbnail={thumbnail} title="Vídeo" onPlyrReady={(plyr: any) => { attachPlayer(plyr); onGateTimerAttach?.(plyr); }} />
        </div>
      </div>
      <TextEditModal
        isOpen={showVideoModal}
        fieldLabel="URL ou ID do vídeo do YouTube"
        value={videoId}
        onSave={handleVideoSave}
        onClose={() => setShowVideoModal(false)}
      />
    </>
  );
}

interface HeroSectionProps {
  onOpenModal: () => void;
  hideNavbar?: boolean;
  revealSeconds?: number;
  contentRevealed?: boolean;
  onReveal?: () => void;
  dynamicContent?: {
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
    cta_text: string;
    [key: string]: string;
  };
}

export default function HeroSection({ onOpenModal, dynamicContent: dc, hideNavbar, revealSeconds = 0, contentRevealed = true, onReveal }: HeroSectionProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const { logo_url } = useSiteConfig();

  const heroTitle = e ? (edit.content.hero_title || dc?.hero_title) : dc?.hero_title;
  const heroSubtitle = e ? (edit.content.hero_subtitle || dc?.hero_subtitle) : dc?.hero_subtitle;
  const heroImage = e ? (edit.content.hero_image || dc?.hero_image) : dc?.hero_image;
  const ctaText = e ? (edit.content.cta_text || dc?.cta_text) : dc?.cta_text;

  const src = e ? edit.content : dc;
  const videoId = src?.vsl_video_id || 'OvV-GvWhQ7s';
  const videoOrientation = src?.vsl_orientation || 'horizontal';
  const videoThumbnail = src?.vsl_thumbnail;

  const titleContent = heroTitle ? (
    <h1 dangerouslySetInnerHTML={{ __html: heroTitle }} style={hideNavbar ? { marginTop: 0, marginBottom: 0 } : undefined} />
  ) : (
    <h1 style={hideNavbar ? { marginTop: 0, marginBottom: 0 } : undefined}>
      A área de membros<br />
      que transforma as suas aulas em{' '}
      <span className="accent">uma máquina de dinheiro.</span>
    </h1>
  );

  const subtitleContent = heroSubtitle ? (
    <p className="subheadline" style={hideNavbar ? { margin: '0 auto' } : undefined}>{heroSubtitle}</p>
  ) : (
    <p className="subheadline" style={hideNavbar ? { margin: '0 auto' } : undefined}>
      Enquanto áreas de membros "estilo Netflix" confundem seus alunos e matam seu faturamento, a Alanis guia cada aluno pelo caminho certo, com 6 fontes de receita extras, engajamento por IA e um sistema viral que cresce sozinho.
    </p>
  );

  const imageEl = (
    <img
      src={heroImage || '/images/hero-1.webp'}
      alt="Alanis Platform"
      className="hero-image"
      loading="eager"
      fetchPriority="high"
      width={560}
      height={350}
      style={{ width: '100%', maxWidth: 560, borderRadius: 'var(--radius-medium)' }}
    />
  );

  const ctaButton = e ? (
    <EditableText fieldKey="cta_text" label="Texto do CTA">
      <a href="#" onClick={(ev) => { ev.preventDefault(); if (!e) onOpenModal(); }} className="btn-primary">
        {ctaText || 'Quero Minha Plataforma Própria →'}
      </a>
    </EditableText>
  ) : (
    <a href="#" onClick={(ev) => { ev.preventDefault(); onOpenModal(); }} className="btn-primary">
      {ctaText || 'Quero Minha Plataforma Própria →'}
    </a>
  );

  // ─── Página Fechada: centered layout with video ───
  if (hideNavbar) {
    const spacing = 24;
    const slug = typeof window !== 'undefined' ? window.location.pathname.replace(/^\//, '') || 'home' : 'home';
    const { attachGateTimer } = useVideoGateTimer(revealSeconds, slug, onReveal || (() => {}));

    // In editor, always show everything
    const showCta = e || contentRevealed;

    return (
      <section id="section-hero" style={{ minHeight: 'auto', paddingTop: 40, paddingBottom: 48 }}>
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="container">
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto',
            gap: spacing,
          }}>
            {/* Headline + Subheadline */}
            <div className="hero-text" style={{ maxWidth: 800, margin: '0 auto' }}>
              {e ? (
                <EditableText fieldKey="hero_title" label="Título do Hero" html>
                  {titleContent}
                </EditableText>
              ) : titleContent}

              <div style={{ marginTop: spacing }}>
                {e ? (
                  <EditableText fieldKey="hero_subtitle" label="Subtítulo do Hero">
                    {subtitleContent}
                  </EditableText>
                ) : subtitleContent}
              </div>
            </div>

            {/* Video — uses HeroVideoBlock (no CSS margin pollution) */}
            <div style={{ width: '100%', maxWidth: 900 }}>
              <HeroVideoBlock
                videoId={videoId}
                orientation={videoOrientation as 'vertical' | 'horizontal'}
                thumbnail={videoThumbnail}
                isEditing={!!e}
                onChangeVideoId={(id: string) => edit?.updateField('vsl_video_id', id)}
                onChangeOrientation={(o: 'vertical' | 'horizontal') => edit?.updateField('vsl_orientation', o)}
                onChangeThumbnail={(url: string) => edit?.updateField('vsl_thumbnail', url)}
                onGateTimerAttach={revealSeconds > 0 ? attachGateTimer : undefined}
              />
            </div>

            {/* CTA — hidden until reveal */}
            <div style={{
              opacity: showCta ? 1 : 0,
              maxHeight: showCta ? '200px' : 0,
              overflow: 'hidden',
              transition: 'opacity 0.6s ease, max-height 0.5s ease',
              pointerEvents: showCta ? 'auto' : 'none',
            }}>
              {ctaButton}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── Página Aberta: original grid layout ───
  return (
    <section id="section-hero">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />
      <div className="container">
        {/* Mobile-only logo (navbar is hidden on mobile) */}
        <img src={logo_url} alt="Logo" className="mobile-hero-logo" />
        <div className="hero-content">
          <div className="hero-text">
            {e ? (
              <EditableText fieldKey="hero_title" label="Título do Hero" html>
                {titleContent}
              </EditableText>
            ) : titleContent}

            {e ? (
              <EditableText fieldKey="hero_subtitle" label="Subtítulo do Hero">
                {subtitleContent}
              </EditableText>
            ) : subtitleContent}

            <div className="hero-cta-group">
              {ctaButton}
            </div>
          </div>
          <div className="hero-visual">
            {e ? (
              <EditableImage fieldKey="hero_image">
                {imageEl}
              </EditableImage>
            ) : imageEl}
          </div>
        </div>
      </div>
    </section>
  );
}
