
interface DynamicIndex {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  cta_text: string;
  [key: string]: string;
}

interface HeroSectionProps {
  onOpenModal: () => void;
  dynamicContent?: DynamicIndex;
}

export default function HeroSection({ onOpenModal, dynamicContent: dc }: HeroSectionProps) {
  return (
    <section id="section-hero">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />
      <div className="container">
        {/* Mobile-only logo (navbar is hidden on mobile) */}
        <img src="/images/logo.webp" alt="Alanis" className="mobile-hero-logo" />
        <div className="hero-content">
          <div className="hero-text">
            {dc ? (
              <h1 dangerouslySetInnerHTML={{ __html: dc.hero_title }} />
            ) : (
              <h1>
                A área de membros<br />
                que transforma as suas aulas em{' '}
                <span className="accent">uma máquina de dinheiro.</span>
              </h1>
            )}
            {dc ? (
              <p className="subheadline">{dc.hero_subtitle}</p>
            ) : (
              <p className="subheadline">
                Enquanto áreas de membros "estilo Netflix" confundem seus alunos e matam seu faturamento, a{' '}
                <img src="/images/logo.webp" alt="Alanis" style={{ height: '1em', verticalAlign: '-3px', display: 'inline' }} />{' '}
                guia cada aluno pelo caminho certo, com 6 fontes de receita extras, engajamento por IA e um sistema viral que cresce sozinho.
              </p>
            )}
            <div className="hero-cta-group">
              <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal(); }} className="btn-primary">
                {dc?.cta_text || 'Quero Minha Plataforma Própria →'}
              </a>
              <div className="powered-badge">
                <span className="powered-badge__label">Powered by</span>
                <img src="/images/logo-hostinger-white.svg" alt="Hostinger" className="powered-badge__logo powered-badge__logo--hostinger" />
                <span className="powered-badge__separator">/</span>
                <img src="/images/logo-cakto-white.svg" alt="Cakto" className="powered-badge__logo powered-badge__logo--cakto" />
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src={dc?.hero_image || '/images/hero-1.webp'}
              alt="Alanis Platform"
              className="hero-image"
              loading="eager"
              fetchPriority="high"
              width={560}
              height={350}
              style={{ width: '100%', maxWidth: 560, borderRadius: 'var(--radius-medium)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
