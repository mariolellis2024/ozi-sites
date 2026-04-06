import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableText from './ui/EditableText';
import { Wallet, BarChart3, Users, ShoppingCart, Gift, Route, PlayCircle, Flame, Trash2 } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useEdit } from '../context/EditContext';
import TextEditModal from './ui/TextEditModal';

/* ── Icon map (string → Lucide component) for JSON serialization ── */
const iconMap: Record<string, React.ReactNode> = {
  Wallet: <Wallet size={26} />,
  BarChart3: <BarChart3 size={26} />,
  Users: <Users size={26} />,
  ShoppingCart: <ShoppingCart size={26} />,
  Gift: <Gift size={26} />,
  Route: <Route size={26} />,
  PlayCircle: <PlayCircle size={26} />,
  Flame: <Flame size={26} />,
};

/* ── Types ── */
interface ComparisonItem {
  icon: string;
  name: string;
  descAlanis: string;
  descOutras: string;
  alanisStatus: 'check' | 'cross' | { pill: string; color: 'green' | 'red' | 'yellow' };
  outrasStatus: 'check' | 'cross' | { pill: string; color: 'green' | 'red' | 'yellow' };
}

const defaultItems: ComparisonItem[] = [
  { icon: 'Wallet', name: 'Fontes de receita', descAlanis: 'Monetize de 6 formas diferentes', descOutras: 'Apenas taxa sobre vendas', alanisStatus: { pill: '6', color: 'green' }, outrasStatus: { pill: '1', color: 'red' } },
  { icon: 'BarChart3', name: 'Analytics por aula', descAlanis: 'Saiba onde cada aluno abandona', descOutras: 'Sem dados granulares', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'Users', name: 'Sistema viral de indicação', descAlanis: 'Cada aluno traz novos alunos', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'ShoppingCart', name: 'Commerce dentro da aula', descAlanis: 'Botão de compra automático no vídeo', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'Gift', name: 'Anúncios nativos', descAlanis: 'Receita com anunciantes parceiros', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'Route', name: 'Trilhas de carreira', descAlanis: 'Sequência definida, sem confusão', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'PlayCircle', name: 'Multiformatos', descAlanis: 'Vídeo, áudio, livro, quiz e desafio', descOutras: 'Apenas vídeo (parcial)', alanisStatus: 'check', outrasStatus: { pill: 'Parcial', color: 'yellow' } },
  { icon: 'Flame', name: 'Desafios tipo Duolingo', descAlanis: 'Engajamento gamificado diário', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
];

/* ── Status icon renderer ── */
function StatusIcon({ status }: { status: ComparisonItem['alanisStatus'] }) {
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

/* ── Delete button (edit mode only) ── */
function DeleteBtn({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={(ev) => { ev.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Remover item"
      style={{
        position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: 6,
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,107,107,0.25)' : 'rgba(255,107,107,0.1)',
        color: '#ff6b6b', transition: 'background 150ms', zIndex: 5,
      }}
    >
      <Trash2 size={13} />
    </button>
  );
}

/* ── Inline editable field (click to edit) ── */
function InlineEdit({ value, label, onSave, className, style }: {
  value: string; label: string; onSave: (v: string) => void;
  className?: string; style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <>
      <span
        className={className}
        style={{
          ...style, cursor: 'pointer',
          outline: hover ? '1px dashed rgba(117,251,198,0.4)' : 'none',
          outlineOffset: 2, borderRadius: 3, transition: 'outline 150ms',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={(ev) => { ev.stopPropagation(); setOpen(true); }}
      >
        {value}
      </span>
      <TextEditModal
        isOpen={open}
        fieldLabel={label}
        value={value}
        onSave={(v) => { onSave(v); setOpen(false); }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/* ── Main Component ── */
interface ComparisonSectionProps {
  onOpenModal: () => void;
  dynamicContent?: Record<string, any>;
}

export default function ComparisonSection({ onOpenModal, dynamicContent: dc }: ComparisonSectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });
  const { logo_url } = useSiteConfig();
  const edit = useEdit();
  const e = edit?.isEditing;
  const src = e ? edit.content : dc;

  const title = src?.comparison_title || 'Alanis vs <span style="color:#FF0049">o resto do mercado</span>.';
  const subtitle = src?.comparison_subtitle || 'Funcionalidade por funcionalidade, a diferença fica clara.';
  const btnText = src?.comparison_btn || 'Quero a Minha Alanis →';
  const noteText = src?.comparison_note || 'Baseado em análise competitiva de Fevereiro 2026.';

  // Items: from saved content or defaults
  const items: ComparisonItem[] = src?.comparison_items || defaultItems;

  // Count alanis checks for score
  const alanisScore = items.filter(f => f.alanisStatus === 'check' || typeof f.alanisStatus === 'object').length;
  const outrasScore = items.filter(f => f.outrasStatus === 'check' || (typeof f.outrasStatus === 'object' && f.outrasStatus.color !== 'red')).length;

  const saveItems = (newItems: ComparisonItem[]) => {
    if (edit) edit.updateField('comparison_items', newItems);
  };

  const deleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    saveItems(newItems);
  };

  const updateItemField = (index: number, field: keyof ComparisonItem, value: string) => {
    const newItems = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    saveItems(newItems);
  };

  return (
    <section id="section-comparativo">
      <div className="container">
        <ScrollFadeIn>
          <div className="section-header">
            <h2>
              {e ? (
                <EditableText fieldKey="comparison_title" label="Título do Comparativo" html>
                  <span dangerouslySetInnerHTML={{ __html: title }} />
                </EditableText>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: title }} />
              )}
            </h2>
            <p className="section-subtitle">
              {e ? (
                <EditableText fieldKey="comparison_subtitle" label="Subtítulo do Comparativo">{subtitle}</EditableText>
              ) : subtitle}
            </p>
          </div>
        </ScrollFadeIn>

        <div ref={ref} className={`comp-cards fade-up${isVisible ? ' visible' : ''}`}>
          {/* ALANIS */}
          <div className="comp-col comp-col--alanis">
            <div className="comp-col__header">
              <div className="comp-col__badge">Recomendado</div>
              <img src={logo_url} alt="Logo" className="comp-col__logo" />
              <p className="comp-col__tagline">Plataforma completa</p>
            </div>
            <div className="comp-col__body">
              {items.map((f, i) => (
                <div key={i} className="comp-feature" style={{ position: 'relative' }}>
                  {e && <DeleteBtn onClick={() => deleteItem(i)} />}
                  <div className="comp-feature__icon">{iconMap[f.icon] || <Wallet size={26} />}</div>
                  <div className="comp-feature__info">
                    {e ? (
                      <>
                        <InlineEdit value={f.name} label={`Nome #${i + 1}`} onSave={(v) => updateItemField(i, 'name', v)} className="comp-feature__name" />
                        <InlineEdit value={f.descAlanis} label={`Descrição Alanis #${i + 1}`} onSave={(v) => updateItemField(i, 'descAlanis', v)} className="comp-feature__desc" />
                      </>
                    ) : (
                      <>
                        <span className="comp-feature__name">{f.name}</span>
                        <span className="comp-feature__desc">{f.descAlanis}</span>
                      </>
                    )}
                  </div>
                  <div className="comp-feature__status"><StatusIcon status={f.alanisStatus} /></div>
                </div>
              ))}
            </div>
            <div className="comp-col__footer">
              <div className="comp-score">
                <span className="comp-score__number">{alanisScore}</span>
                <span className="comp-score__label">de {items.length} funcionalidades</span>
              </div>
              <div className="comp-score__bar">
                <div className="comp-score__fill" style={{ '--score': `${items.length > 0 ? Math.round(alanisScore / items.length * 100) : 0}%` } as React.CSSProperties} />
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
              {items.map((f, i) => (
                <div key={i} className="comp-feature" style={{ position: 'relative' }}>
                  <div className="comp-feature__icon">{iconMap[f.icon] || <Wallet size={26} />}</div>
                  <div className="comp-feature__info">
                    {e ? (
                      <>
                        <span className="comp-feature__name">{f.name}</span>
                        <InlineEdit value={f.descOutras} label={`Descrição Outras #${i + 1}`} onSave={(v) => updateItemField(i, 'descOutras', v)} className="comp-feature__desc" />
                      </>
                    ) : (
                      <>
                        <span className="comp-feature__name">{f.name}</span>
                        <span className="comp-feature__desc">{f.descOutras}</span>
                      </>
                    )}
                  </div>
                  <div className="comp-feature__status"><StatusIcon status={f.outrasStatus} /></div>
                </div>
              ))}
            </div>
            <div className="comp-col__footer">
              <div className="comp-score">
                <span className="comp-score__number comp-score__number--red">{outrasScore}</span>
                <span className="comp-score__label">de {items.length} funcionalidades</span>
              </div>
              <div className="comp-score__bar">
                <div className="comp-score__fill comp-score__fill--red" style={{ '--score': `${items.length > 0 ? Math.round(outrasScore / items.length * 100) : 0}%` } as React.CSSProperties} />
              </div>
            </div>
          </div>
        </div>

        <p className="comparison-note">
          {e ? (
            <EditableText fieldKey="comparison_note" label="Nota do Comparativo">{noteText}</EditableText>
          ) : noteText}
        </p>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="#" onClick={(ev) => { ev.preventDefault(); onOpenModal(); }} className="btn-primary">
            {e ? (
              <EditableText fieldKey="comparison_btn" label="Botão do Comparativo">{btnText}</EditableText>
            ) : btnText}
          </a>
        </div>
      </div>
    </section>
  );
}
