import { useEdit } from '../context/EditContext';
import EditableText from './ui/EditableText';
import EditableImage from './ui/EditableImage';

interface HeroSectionProps {
  onOpenModal: () => void;
  dynamicContent?: {
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
    cta_text: string;
    [key: string]: string;
  };
}

export default function HeroSection({ onOpenModal, dynamicContent: dc }: HeroSectionProps) {
  const edit = useEdit();
  const e = edit?.isEditing;

  // In edit mode, use EditContext content (which updates live); otherwise use props
  const heroTitle = e ? (edit.content.hero_title || dc?.hero_title) : dc?.hero_title;
  const heroSubtitle = e ? (edit.content.hero_subtitle || dc?.hero_subtitle) : dc?.hero_subtitle;
  const heroImage = e ? (edit.content.hero_image || dc?.hero_image) : dc?.hero_image;
  const ctaText = e ? (edit.content.cta_text || dc?.cta_text) : dc?.cta_text;

  const titleContent = heroTitle ? (
    <h1 dangerouslySetInnerHTML={{ __html: heroTitle }} />
  ) : (
    <h1>
      A área de membros<br />
      que transforma as suas aulas em{' '}
      <span className="accent">uma máquina de dinheiro.</span>
    </h1>
  );

  const subtitleContent = heroSubtitle ? (
    <p className="subheadline">{heroSubtitle}</p>
  ) : (
    <p className="subheadline">
      Enquanto áreas de membros "estilo Netflix" confundem seus alunos e matam seu faturamento, a{' '}
      <img src="/images/logo.webp" alt="Alanis" style={{ height: '1em', verticalAlign: '-3px', display: 'inline' }} />{' '}
      guia cada aluno pelo caminho certo, com 6 fontes de receita extras, engajamento por IA e um sistema viral que cresce sozinho.
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

  return (
    <section id="section-hero">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />
      <div className="container">
        {/* Mobile-only logo (navbar is hidden on mobile) */}
        <img src="/images/logo.webp" alt="Alanis" className="mobile-hero-logo" />
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
              {e ? (
                <EditableText fieldKey="cta_text" label="Texto do CTA">
                  <a href="#" onClick={(ev) => { ev.preventDefault(); if (!e) onOpenModal(); }} className="btn-primary">
                    {ctaText || 'Quero Minha Plataforma Própria →'}
                  </a>
                </EditableText>
              ) : (
                <a href="#" onClick={(ev) => { ev.preventDefault(); onOpenModal(); }} className="btn-primary">
                  {ctaText || 'Quero Minha Plataforma Própria →'}
                </a>
              )}
              <div className="powered-badge">
                <span className="powered-badge__label">Powered by</span>
                <img src="/images/logo-hostinger-white.svg" alt="Hostinger" className="powered-badge__logo powered-badge__logo--hostinger" />
                <span className="powered-badge__separator">/</span>
                <img src="/images/logo-cakto-white.svg" alt="Cakto" className="powered-badge__logo powered-badge__logo--cakto" />
              </div>
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
