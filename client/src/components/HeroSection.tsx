import { useEdit } from '../context/EditContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import EditableText from './ui/EditableText';
import EditableImage from './ui/EditableImage';
import { VideoBlock } from './BenefitsGrid';

interface HeroSectionProps {
  onOpenModal: () => void;
  hideNavbar?: boolean;
  dynamicContent?: {
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
    cta_text: string;
    [key: string]: string;
  };
}

export default function HeroSection({ onOpenModal, dynamicContent: dc, hideNavbar }: HeroSectionProps) {
  const edit = useEdit();
  const e = edit?.isEditing;
  const { logo_url } = useSiteConfig();

  // In edit mode, use EditContext content (which updates live); otherwise use props
  const heroTitle = e ? (edit.content.hero_title || dc?.hero_title) : dc?.hero_title;
  const heroSubtitle = e ? (edit.content.hero_subtitle || dc?.hero_subtitle) : dc?.hero_subtitle;
  const heroImage = e ? (edit.content.hero_image || dc?.hero_image) : dc?.hero_image;
  const ctaText = e ? (edit.content.cta_text || dc?.cta_text) : dc?.cta_text;

  const src = e ? edit.content : dc;
  const videoId = src?.vsl_video_id || 'OvV-GvWhQ7s';
  const videoOrientation = src?.vsl_orientation || 'horizontal';
  const videoThumbnail = src?.vsl_thumbnail;

  const titleContent = heroTitle ? (
    <h1 dangerouslySetInnerHTML={{ __html: heroTitle }} style={hideNavbar ? { margin: 0 } : undefined} />
  ) : (
    <h1 style={hideNavbar ? { margin: 0 } : undefined}>
      A área de membros<br />
      que transforma as suas aulas em{' '}
      <span className="accent">uma máquina de dinheiro.</span>
    </h1>
  );

  const subtitleContent = heroSubtitle ? (
    <p className="subheadline" style={hideNavbar ? { margin: 0 } : undefined}>{heroSubtitle}</p>
  ) : (
    <p className="subheadline" style={hideNavbar ? { margin: 0 } : undefined}>
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
    return (
      <section id="section-hero" style={{ minHeight: 'auto', paddingTop: 40, paddingBottom: 48 }}>
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="container">
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto',
            gap: 20,
          }}>
            {/* Headline + Subheadline */}
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ marginBottom: 0 }}>
                {e ? (
                  <EditableText fieldKey="hero_title" label="Título do Hero" html>
                    {titleContent}
                  </EditableText>
                ) : titleContent}
              </div>

              <div style={{ marginTop: 12 }}>
                {e ? (
                  <EditableText fieldKey="hero_subtitle" label="Subtítulo do Hero">
                    {subtitleContent}
                  </EditableText>
                ) : subtitleContent}
              </div>
            </div>

            {/* Video */}
            <div style={{ width: '100%', maxWidth: 900 }}>
              <VideoBlock
                videoId={videoId}
                orientation={videoOrientation as 'vertical' | 'horizontal'}
                thumbnail={videoThumbnail}
                isEditing={!!e}
                onChangeVideoId={(id: string) => edit?.updateField('vsl_video_id', id)}
                onChangeOrientation={(o: 'vertical' | 'horizontal') => edit?.updateField('vsl_orientation', o)}
                onChangeThumbnail={(url: string) => edit?.updateField('vsl_thumbnail', url)}
              />
            </div>

            {/* CTA */}
            <div>
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
