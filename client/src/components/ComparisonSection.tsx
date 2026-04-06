import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import ScrollFadeIn from './ui/ScrollFadeIn';
import { Wallet, BarChart3, Users, ShoppingCart, Gift, Route, PlayCircle, Flame } from 'lucide-react';

interface FeatureRow {
  icon: React.ReactNode;
  name: string;
  descAlanis: string;
  descOutras: string;
  alanisStatus: 'check' | 'cross' | { pill: string; color: 'green' | 'red' | 'yellow' };
  outrasStatus: 'check' | 'cross' | { pill: string; color: 'green' | 'red' | 'yellow' };
}

const features: FeatureRow[] = [
  { icon: <Wallet size={26} />, name: 'Fontes de receita', descAlanis: 'Monetize de 6 formas diferentes', descOutras: 'Apenas taxa sobre vendas', alanisStatus: { pill: '6', color: 'green' }, outrasStatus: { pill: '1', color: 'red' } },
  { icon: <BarChart3 size={26} />, name: 'Analytics por aula', descAlanis: 'Saiba onde cada aluno abandona', descOutras: 'Sem dados granulares', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: <Users size={26} />, name: 'Sistema viral de indicação', descAlanis: 'Cada aluno traz novos alunos', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: <ShoppingCart size={26} />, name: 'Commerce dentro da aula', descAlanis: 'Botão de compra automático no vídeo', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: <Gift size={26} />, name: 'Anúncios nativos', descAlanis: 'Receita com anunciantes parceiros', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: <Route size={26} />, name: 'Trilhas de carreira', descAlanis: 'Sequência definida, sem confusão', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: <PlayCircle size={26} />, name: 'Multiformatos', descAlanis: 'Vídeo, áudio, livro, quiz e desafio', descOutras: 'Apenas vídeo (parcial)', alanisStatus: 'check', outrasStatus: { pill: 'Parcial', color: 'yellow' } },
  { icon: <Flame size={26} />, name: 'Desafios tipo Duolingo', descAlanis: 'Engajamento gamificado diário', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
];

function StatusIcon({ status }: { status: FeatureRow['alanisStatus'] }) {
  if (typeof status === 'object') {
    return <span className={`comp-value-pill comp-value-pill--${status.color}`}>{status.pill}</span>;
  }
  if (status === 'check') {
    return (
      <svg className="comp-check-svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <polyline points="7 12 10.5 15.5 17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
      </svg>
    );
  }
  return (
    <svg className="comp-cross-svg" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="cross-draw" />
      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="cross-draw" />
    </svg>
  );
}

interface ComparisonSectionProps {
  onOpenModal: () => void;
}

export default function ComparisonSection({ onOpenModal }: ComparisonSectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });

  return (
    <section id="section-comparativo">
      <div className="container">
        <ScrollFadeIn>
          <div className="section-header">
            <h2>
              <img src="/images/logo.webp" alt="Alanis" style={{ height: '1em', verticalAlign: '-6px', display: 'inline' }} /> vs{' '}
              <span style={{ color: '#FF0049' }}>o resto do mercado</span>.
            </h2>
            <p className="section-subtitle">Funcionalidade por funcionalidade, a diferença fica clara.</p>
          </div>
        </ScrollFadeIn>

        <div ref={ref} className={`comp-cards fade-up${isVisible ? ' visible' : ''}`}>
          {/* ALANIS */}
          <div className="comp-col comp-col--alanis">
            <div className="comp-col__header">
              <div className="comp-col__badge">Recomendado</div>
              <img src="/images/logo.webp" alt="Alanis" className="comp-col__logo" />
              <p className="comp-col__tagline">Plataforma completa</p>
            </div>
            <div className="comp-col__body">
              {features.map((f, i) => (
                <div key={i} className="comp-feature">
                  <div className="comp-feature__icon">{f.icon}</div>
                  <div className="comp-feature__info">
                    <span className="comp-feature__name">{f.name}</span>
                    <span className="comp-feature__desc">{f.descAlanis}</span>
                  </div>
                  <div className="comp-feature__status"><StatusIcon status={f.alanisStatus} /></div>
                </div>
              ))}
            </div>
            <div className="comp-col__footer">
              <div className="comp-score">
                <span className="comp-score__number">9</span>
                <span className="comp-score__label">de 9 funcionalidades</span>
              </div>
              <div className="comp-score__bar">
                <div className="comp-score__fill" style={{ '--score': '100%' } as React.CSSProperties} />
              </div>
            </div>
          </div>

          {/* OUTRAS */}
          <div className="comp-col comp-col--outras">
            <div className="comp-col__header">
              <span className="comp-col__title-text">Outras plataformas</span>
              <p className="comp-col__tagline">Funcionalidade limitada</p>
            </div>
            <div className="comp-col__body">
              {features.map((f, i) => (
                <div key={i} className="comp-feature">
                  <div className="comp-feature__icon">{f.icon}</div>
                  <div className="comp-feature__info">
                    <span className="comp-feature__name">{f.name}</span>
                    <span className="comp-feature__desc">{f.descOutras}</span>
                  </div>
                  <div className="comp-feature__status"><StatusIcon status={f.outrasStatus} /></div>
                </div>
              ))}
            </div>
            <div className="comp-col__footer">
              <div className="comp-score">
                <span className="comp-score__number comp-score__number--red">1</span>
                <span className="comp-score__label">de 9 funcionalidades</span>
              </div>
              <div className="comp-score__bar">
                <div className="comp-score__fill comp-score__fill--red" style={{ '--score': '11%' } as React.CSSProperties} />
              </div>
            </div>
          </div>
        </div>

        <p className="comparison-note">Baseado em análise competitiva de Fevereiro 2026.</p>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal(); }} className="btn-primary">
            Quero a Minha Alanis →
          </a>
        </div>
      </div>
    </section>
  );
}
