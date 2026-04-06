import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import ScrollFadeIn from './ui/ScrollFadeIn';

const steps = [
  {
    number: 1,
    image: 'passo-1.webp',
    items: [
      'Código próprio, resultado de 1 ano de desenvolvimento intenso',
      'Validado pelos maiores infoprodutores do mercado',
      'Pagou uma vez, é seu para sempre, sem mensalidades',
    ],
  },
  {
    number: 2,
    image: 'passo-2.webp',
    items: [
      'Siga o guia amigável',
      'Em 30 minutos sua Alanis está no ar e funcionando',
      'Instalação tão simples que qualquer pessoa consegue',
    ],
  },
  {
    number: 3,
    image: 'passo-3.webp',
    items: [
      'Coloque sua logo, cores e domínio, 100% white label',
      'Integre seu Pixel do Facebook e ferramentas de analytics',
      'Conecte com a Cakto para processar pagamentos na hora',
    ],
  },
  {
    number: 4,
    image: 'passo-4.webp',
    items: [
      'Upload de vídeos, áudios, PDFs e materiais de forma intuitiva',
      'Organize em trilhas de carreira com sequência definida',
      'Crie cursos, módulos e aulas em poucos cliques',
    ],
  },
  {
    number: 5,
    image: 'passo-5.webp',
    items: [
      'Leve seus alunos para a plataforma e a Alanis vende para você',
      '6 fontes de receita ativas 24h por dia, no automático',
      'Sistema de indicação viral que multiplica sua base sozinho',
    ],
  },
];

export default function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const fill = fillRef.current;
    const line = lineRef.current;
    if (!section || !fill || !line) return;

    const measure = () => {
      const dots = section.querySelectorAll('.timeline-dot');
      if (dots.length < 2) return;
      const timeline = section.querySelector('.timeline');
      if (!timeline) return;
      const timelineRect = timeline.getBoundingClientRect();
      const firstDot = dots[0];
      const lastDot = dots[dots.length - 1];
      const firstCenter = firstDot.getBoundingClientRect().top + (firstDot as HTMLElement).offsetHeight / 2 - timelineRect.top;
      const lastCenter = lastDot.getBoundingClientRect().top + (lastDot as HTMLElement).offsetHeight / 2 - timelineRect.top;
      const tlTop = firstCenter;
      const tlHeight = lastCenter - firstCenter;
      line.style.top = tlTop + 'px';
      line.style.height = tlHeight + 'px';
      fill.style.top = tlTop + 'px';
      return { tlTop, tlHeight };
    };

    requestAnimationFrame(() => requestAnimationFrame(measure));

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const dims = measure();
        if (!dims) { ticking = false; return; }
        const viewportH = window.innerHeight;
        const rect = section.getBoundingClientRect();
        if (rect.top < viewportH && rect.bottom > 0) {
          const progress = Math.min(1, Math.max(0, (viewportH - rect.top) / (section.offsetHeight + viewportH * 0.4)));
          fill.style.height = Math.min(progress * section.offsetHeight, dims.tlHeight) + 'px';
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); }, { passive: true } as any);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section id="section-como-funciona" ref={sectionRef}>
      <div className="section-watermark">5 PASSOS</div>
      <div className="container">
        <ScrollFadeIn>
          <div className="section-header">
            <h2>5 passos para transformar sua operação.</h2>
          </div>
        </ScrollFadeIn>
        <div className="timeline">
          <div className="timeline-line" ref={lineRef} />
          <div className="timeline-line-fill" ref={fillRef} />
          {steps.map((step, i) => (
            <div className="timeline-step" key={step.number}>
              {i % 2 === 0 ? (
                <>
                  <ScrollFadeIn>
                    <div className="step-content">
                      <div className="step-number">{step.number}</div>
                      <img src={`/images/${step.image}`} alt={`Passo ${step.number}`} className="step-illustration" loading="lazy" decoding="async" />
                      <ul className="checklist">
                        {step.items.map((item, j) => (
                          <li key={j} className="check-item">
                            <Check size={20} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollFadeIn>
                  <div className="timeline-dot" />
                </>
              ) : (
                <>
                  <div className="timeline-dot" />
                  <ScrollFadeIn>
                    <div className="step-content">
                      <div className="step-number">{step.number}</div>
                      <img src={`/images/${step.image}`} alt={`Passo ${step.number}`} className="step-illustration" loading="lazy" decoding="async" />
                      <ul className="checklist">
                        {step.items.map((item, j) => (
                          <li key={j} className="check-item">
                            <Check size={20} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollFadeIn>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
