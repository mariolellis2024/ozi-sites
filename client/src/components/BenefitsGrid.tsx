import { useState, useCallback } from 'react';
import ScrollFadeIn from './ui/ScrollFadeIn';
import YouTubeFacade from './ui/YouTubeFacade';
import EditableImage from './ui/EditableImage';
import EditableText from './ui/EditableText';
import { useEdit } from '../context/EditContext';
import TextEditModal from './ui/TextEditModal';

/** Extract YouTube video ID from various URL formats or raw ID */
function extractVideoId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Already a bare ID (11 chars, no slashes)
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  // youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch) return shortMatch[1];
  // youtube.com/watch?v=ID or youtube.com/embed/ID or youtube.com/shorts/ID
  const longMatch = trimmed.match(/(?:v=|embed\/|shorts\/)([\w-]{11})/);
  if (longMatch) return longMatch[1];
  return trimmed;
}

/** Video block with orientation toggle and editable video ID */
function VideoBlock({ videoId, orientation, isEditing, onChangeVideoId, onChangeOrientation }: {
  videoId: string;
  orientation: 'vertical' | 'horizontal';
  isEditing: boolean;
  onChangeVideoId: (id: string) => void;
  onChangeOrientation: (o: 'vertical' | 'horizontal') => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [hover, setHover] = useState(false);

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

  const handleSave = useCallback((val: string) => {
    const id = extractVideoId(val);
    if (id) onChangeVideoId(id);
    setShowModal(false);
  }, [onChangeVideoId]);

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Orientation toggle - edit mode only */}
        {isEditing && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12,
          }}>
            <button
              onClick={() => onChangeOrientation('vertical')}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                background: isVertical ? 'rgba(117,251,198,0.15)' : 'rgba(255,255,255,0.06)',
                color: isVertical ? '#75fbc6' : 'rgba(255,255,255,0.5)',
                transition: 'all 150ms',
              }}
            >
              📱 Vertical
            </button>
            <button
              onClick={() => onChangeOrientation('horizontal')}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                background: !isVertical ? 'rgba(117,251,198,0.15)' : 'rgba(255,255,255,0.06)',
                color: !isVertical ? '#75fbc6' : 'rgba(255,255,255,0.5)',
                transition: 'all 150ms',
              }}
            >
              🖥 Horizontal
            </button>
          </div>
        )}
        <div
          style={{
            ...wrapperStyle,
            cursor: isEditing ? 'pointer' : undefined,
            outline: isEditing && hover ? '2px dashed rgba(117,251,198,0.5)' : '2px dashed transparent',
            outlineOffset: 4,
          }}
          onMouseEnter={() => isEditing && setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={(ev) => { if (isEditing) { ev.preventDefault(); ev.stopPropagation(); setShowModal(true); } }}
        >
          <YouTubeFacade videoId={videoId} title="Vídeo" />
        </div>
      </div>
      <TextEditModal
        isOpen={showModal}
        fieldLabel="URL ou ID do vídeo do YouTube"
        value={videoId}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

const defaultBenefits = [
  { icon: '/images/icon-1.webp', title: '6 Fontes de Receita' },
  { icon: '/images/icon-2.webp', title: 'Engajamento por IA' },
  { icon: '/images/icon-3.webp', title: 'Trilhas de Carreira' },
  { icon: '/images/icon-4.webp', title: 'Sistema Viral de Indicação' },
  { icon: '/images/icon-5.webp', title: 'Commerce Dentro da Aula' },
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
              <EditableText fieldKey="benefits_title" label="Título da seção">
                {benefitsTitle}
              </EditableText>
            ) : benefitsTitle}
          </h2>
        </ScrollFadeIn>
        <div className="benefits-grid stagger-children">
          {benefits.map((b, i) => (
            <ScrollFadeIn key={i}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  {e ? (
                    <EditableImage fieldKey={b.iconKey}>
                      <img src={b.icon} alt={b.title} width={48} height={48} loading="lazy" decoding="async" />
                    </EditableImage>
                  ) : (
                    <img src={b.icon} alt={b.title} width={48} height={48} loading="lazy" decoding="async" />
                  )}
                </div>
                <h3>
                  {e ? (
                    <EditableText fieldKey={b.titleKey} label={`Benefício ${i + 1}`}>
                      {b.title}
                    </EditableText>
                  ) : b.title}
                </h3>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
        <ScrollFadeIn>
          <VideoBlock
            videoId={src?.vsl_video_id || '3t8-rLdcssE'}
            orientation={src?.vsl_orientation || 'vertical'}
            isEditing={!!e}
            onChangeVideoId={(id: string) => edit?.updateField('vsl_video_id', id)}
            onChangeOrientation={(o: 'vertical' | 'horizontal') => edit?.updateField('vsl_orientation', o)}
          />
        </ScrollFadeIn>
      </div>
    </section>
  );
}
