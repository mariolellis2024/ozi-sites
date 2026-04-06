import { useState, useCallback, useRef } from 'react';
import ScrollFadeIn from './ui/ScrollFadeIn';
import PlyrYouTubePlayer from './ui/PlyrYouTubePlayer';
import EditableImage from './ui/EditableImage';
import EditableText from './ui/EditableText';
import { useEdit } from '../context/EditContext';
import TextEditModal from './ui/TextEditModal';
import { Pencil, Image as ImageIcon } from 'lucide-react';
import { useVideoRetention } from '../hooks/useVideoRetention';

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

/** Video block with Plyr player, custom thumbnail, orientation toggle */
function VideoBlock({ videoId, orientation, thumbnail, isEditing, onChangeVideoId, onChangeOrientation, onChangeThumbnail }: {
  videoId: string;
  orientation: 'vertical' | 'horizontal';
  thumbnail?: string;
  isEditing: boolean;
  onChangeVideoId: (id: string) => void;
  onChangeOrientation: (o: 'vertical' | 'horizontal') => void;
  onChangeThumbnail: (url: string) => void;
}) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const edit = useEdit();

  // Retention tracking — derive slug from URL
  const slug = window.location.pathname.replace(/^\//, '') || 'home';
  const { attachPlayer } = useVideoRetention(slug, videoId);

  const isVertical = orientation === 'vertical';

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: isVertical ? 400 : 900,
    margin: '0 auto 24px',
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

  const editToolbarStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap',
  };

  const toolBtnStyle = (active?: boolean): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
    background: active ? 'rgba(117,251,198,0.15)' : 'rgba(255,255,255,0.06)',
    color: active ? '#75fbc6' : 'rgba(255,255,255,0.5)',
    transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <>
      <div className="vsl-container" style={{ position: 'relative' }}>
        {/* Edit toolbar */}
        {isEditing && (
          <div style={editToolbarStyle}>
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
          <PlyrYouTubePlayer videoId={videoId} thumbnail={thumbnail} title="Vídeo" onPlyrReady={attachPlayer} />
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


const defaultBenefits = [
  { icon: '/images/icon-1.webp', title: '6 Fontes de Receita' },
  { icon: '/images/icon-2.webp', title: 'Engajamento por IA' },
  { icon: '/images/icon-3.webp', title: 'Trilhas de Carreira' },
  { icon: '/images/icon-4.webp', title: 'Sistema Viral de Indicação' },
];

interface BenefitsGridProps {
  dynamicContent?: Record<string, any>;
}


export default function BenefitsGrid({ dynamicContent: dc }: BenefitsGridProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const benefitsTitle = src?.benefits_title || 'O que só a Alanis tem.';

  // Build benefits array from dynamic content or defaults
  const benefits = defaultBenefits.map((def, i) => {
    const idx = i + 1;
    return {
      icon: src?.[`benefit_${idx}_icon`] || def.icon,
      title: src?.[`benefit_${idx}_title`] || def.title,
      iconKey: `benefit_${idx}_icon`,
      titleKey: `benefit_${idx}_title`,
    };
  });

  return (
    <section id="section-quick-benefits">
      <div className="container">
        <ScrollFadeIn>
          <h2 className="benefits-headline">
            {e ? (
              <EditableText fieldKey="benefits_title" label="Título da seção" html>
                <span dangerouslySetInnerHTML={{ __html: benefitsTitle }} />
              </EditableText>
            ) : <span dangerouslySetInnerHTML={{ __html: benefitsTitle }} />}
          </h2>
        </ScrollFadeIn>
        <div className="benefits-grid stagger-children">
          {benefits.map((b, i) => (
            <ScrollFadeIn key={i}>
              <div className="benefit-card">
                <h3>
                  {e ? (
                    <EditableText fieldKey={b.titleKey} label={`Benefício ${i + 1}`} html>
                      <span dangerouslySetInnerHTML={{ __html: b.title }} />
                    </EditableText>
                  ) : <span dangerouslySetInnerHTML={{ __html: b.title }} />}
                </h3>
                <div className="benefit-icon">
                  {e ? (
                    <EditableImage fieldKey={b.iconKey}>
                      <img src={b.icon} alt="" loading="lazy" decoding="async" />
                    </EditableImage>
                  ) : (
                    <img src={b.icon} alt="" loading="lazy" decoding="async" />
                  )}
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
        <ScrollFadeIn>
          <VideoBlock
            videoId={src?.vsl_video_id || '3t8-rLdcssE'}
            orientation={src?.vsl_orientation || 'vertical'}
            thumbnail={src?.vsl_thumbnail}
            isEditing={!!e}
            onChangeVideoId={(id: string) => edit?.updateField('vsl_video_id', id)}
            onChangeOrientation={(o: 'vertical' | 'horizontal') => edit?.updateField('vsl_orientation', o)}
            onChangeThumbnail={(url: string) => edit?.updateField('vsl_thumbnail', url)}
          />
        </ScrollFadeIn>
      </div>
    </section>
  );
}
