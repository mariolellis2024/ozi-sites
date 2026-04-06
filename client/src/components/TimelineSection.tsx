import { useEffect, useRef } from 'react';
import { Check, Trash2, Copy, Plus } from 'lucide-react';

const actionBtnBase: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: 0.6, transition: 'opacity 150ms',
};

import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableText from './ui/EditableText';
import EditableImage from './ui/EditableImage';
import { useEdit } from '../context/EditContext';

const defaultSteps = [
  {
    number: 1,
    image: '/images/passo-1.webp',
    items: [
      'Código próprio, resultado de 1 ano de desenvolvimento intenso',
      'Validado pelos maiores infoprodutores do mercado',
      'Pagou uma vez, é seu para sempre, sem mensalidades',
    ],
  },
  {
    number: 2,
    image: '/images/passo-2.webp',
    items: [
      'Siga o guia amigável',
      'Em 30 minutos sua Alanis está no ar e funcionando',
      'Instalação tão simples que qualquer pessoa consegue',
    ],
  },
  {
    number: 3,
    image: '/images/passo-3.webp',
    items: [
      'Coloque sua logo, cores e domínio, 100% white label',
      'Integre seu Pixel do Facebook e ferramentas de analytics',
      'Conecte com a Cakto para processar pagamentos na hora',
    ],
  },
  {
    number: 4,
    image: '/images/passo-4.webp',
    items: [
      'Upload de vídeos, áudios, PDFs e materiais de forma intuitiva',
      'Organize em trilhas de carreira com sequência definida',
      'Crie cursos, módulos e aulas em poucos cliques',
    ],
  },
  {
    number: 5,
    image: '/images/passo-5.webp',
    items: [
      'Leve seus alunos para a plataforma e a Alanis vende para você',
      '6 fontes de receita ativas 24h por dia, no automático',
      'Sistema de indicação viral que multiplica sua base sozinho',
    ],
  },
];

interface TimelineSectionProps {
  dynamicContent?: Record<string, any>;
}

export default function TimelineSection({ dynamicContent: dc }: TimelineSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const sectionTitle = src?.timeline_title || '5 passos para transformar sua operação.';

  const steps = defaultSteps.map((def, i) => {
    const stepNum = i + 1;
    const savedItems = src?.[`step_${stepNum}_items`];
    return {
      number: def.number,
      image: src?.[`step_${stepNum}_image`] || def.image,
      items: Array.isArray(savedItems) ? savedItems : def.items.map((item, j) => src?.[`step_${stepNum}_item_${j}`] || item),
      imageKey: `step_${stepNum}_image`,
      itemsKey: `step_${stepNum}_items`,
    };
  });

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

  const renderStep = (step: typeof steps[0], i: number) => {
    const stepContent = (
      <div className="step-content">
        <div className="step-number">{step.number}</div>
        {e ? (
          <EditableImage fieldKey={step.imageKey}>
            <img src={step.image} alt={`Passo ${step.number}`} className="step-illustration" loading="lazy" decoding="async" />
          </EditableImage>
        ) : (
          <img src={step.image} alt={`Passo ${step.number}`} className="step-illustration" loading="lazy" decoding="async" />
        )}
        <ul className="checklist">
          {step.items.map((item, j) => (
            <li key={j} className="check-item" style={{ position: 'relative' }}>
              <Check size={20} />
              {e ? (
                <>
                  <EditableText
                    fieldKey={`__inline_step_${step.number}_${j}`}
                    label={`Passo ${step.number}, Item ${j + 1}`}
                    onCustomSave={(val) => {
                      const newItems = [...step.items];
                      newItems[j] = val;
                      edit!.updateField(step.itemsKey, newItems);
                    }}
                    customValue={item}
                  >
                    <span>{item}</span>
                  </EditableText>
                  <div style={{
                    position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        const newItems = [...step.items];
                        newItems.splice(j + 1, 0, step.items[j]);
                        edit!.updateField(step.itemsKey, newItems);
                      }}
                      title="Duplicar item"
                      style={{ ...actionBtnBase, background: 'rgba(117,251,198,0.12)', color: '#75fbc6' }}
                      onMouseEnter={ev => { ev.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.opacity = '0.6'; }}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        edit!.updateField(step.itemsKey, step.items.filter((_, k) => k !== j));
                      }}
                      title="Remover item"
                      style={{ ...actionBtnBase, background: 'rgba(255,107,107,0.15)', color: '#ff6b6b' }}
                      onMouseEnter={ev => { ev.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.opacity = '0.6'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              ) : (
                <span>{item}</span>
              )}
            </li>
          ))}
        </ul>
        {e && (
          <button
            onClick={() => edit!.updateField(step.itemsKey, [...step.items, 'Novo item — clique para editar'])}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 8, padding: '6px 14px', borderRadius: 8,
              border: '1px dashed rgba(117,251,198,0.3)', cursor: 'pointer',
              background: 'rgba(117,251,198,0.06)', color: '#75fbc6',
              fontSize: '0.8rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
              transition: 'all 150ms',
            }}
            onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(117,251,198,0.12)'; }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(117,251,198,0.06)'; }}
          >
            <Plus size={14} /> Adicionar item
          </button>
        )}
      </div>
    );

    return (
      <div className="timeline-step" key={step.number}>
        {i % 2 === 0 ? (
          <>
            <ScrollFadeIn>{stepContent}</ScrollFadeIn>
            <div className="timeline-dot" />
          </>
        ) : (
          <>
            <div className="timeline-dot" />
            <ScrollFadeIn>{stepContent}</ScrollFadeIn>
          </>
        )}
      </div>
    );
  };

  return (
    <section id="section-como-funciona" ref={sectionRef}>
      <div className="section-watermark">5 PASSOS</div>
      <div className="container">
        <ScrollFadeIn>
          <div className="section-header">
            <h2>
              {e ? (
                <EditableText fieldKey="timeline_title" label="Título da Timeline">{sectionTitle}</EditableText>
              ) : sectionTitle}
            </h2>
          </div>
        </ScrollFadeIn>
        <div className="timeline">
          <div className="timeline-line" ref={lineRef} />
          <div className="timeline-line-fill" ref={fillRef} />
          {steps.map((step, i) => renderStep(step, i))}
        </div>
      </div>
    </section>
  );
}
