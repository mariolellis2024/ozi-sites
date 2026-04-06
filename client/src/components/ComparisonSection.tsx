import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import ScrollFadeIn from './ui/ScrollFadeIn';
import EditableText from './ui/EditableText';
import {
  Wallet, BarChart3, Users, ShoppingCart, Gift, Route, PlayCircle, Flame, Trash2,
  // Extended icon set for picker
  Star, Heart, Zap, Target, Award, Globe, Shield, Lock, Unlock, Key,
  BookOpen, GraduationCap, Lightbulb, Rocket, TrendingUp, PieChart, LineChart,
  Monitor, Smartphone, Cpu, Cloud, Database, Server, Wifi,
  MessageCircle, Mail, Bell, Send, Share2, Link,
  Camera, Video, Music, Mic, Headphones, Image,
  Clock, Calendar, Timer, AlarmClock,
  Check, X, AlertTriangle, Info, HelpCircle,
  Box, Package, Layers, Grid, Layout, Palette,
  Compass, Map, Navigation, Crosshair,
  DollarSign, CreditCard, Banknote, Coins, BadgeDollarSign,
  ThumbsUp, ThumbsDown, Smile, Frown, Meh,
  Eye, EyeOff, Search, Filter, Settings, Sliders,
  FileText, FolderOpen, Download, Upload, Save,
  RefreshCw, RotateCcw, Maximize, Minimize, Move,
  Crown, Diamond, Gem, Trophy, Medal,
  Brain, Sparkles, Wand2, Puzzle, CircuitBoard
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useEdit } from '../context/EditContext';
import TextEditModal from './ui/TextEditModal';

/* ── Icon map with all available icons ── */
const iconMap: Record<string, React.ReactNode> = {
  Wallet: <Wallet size={26} />, BarChart3: <BarChart3 size={26} />, Users: <Users size={26} />,
  ShoppingCart: <ShoppingCart size={26} />, Gift: <Gift size={26} />, Route: <Route size={26} />,
  PlayCircle: <PlayCircle size={26} />, Flame: <Flame size={26} />,
  Star: <Star size={26} />, Heart: <Heart size={26} />, Zap: <Zap size={26} />,
  Target: <Target size={26} />, Award: <Award size={26} />, Globe: <Globe size={26} />,
  Shield: <Shield size={26} />, Lock: <Lock size={26} />, Unlock: <Unlock size={26} />,
  Key: <Key size={26} />, BookOpen: <BookOpen size={26} />, GraduationCap: <GraduationCap size={26} />,
  Lightbulb: <Lightbulb size={26} />, Rocket: <Rocket size={26} />, TrendingUp: <TrendingUp size={26} />,
  PieChart: <PieChart size={26} />, LineChart: <LineChart size={26} />,
  Monitor: <Monitor size={26} />, Smartphone: <Smartphone size={26} />, Cpu: <Cpu size={26} />,
  Cloud: <Cloud size={26} />, Database: <Database size={26} />, Server: <Server size={26} />,
  Wifi: <Wifi size={26} />, MessageCircle: <MessageCircle size={26} />, Mail: <Mail size={26} />,
  Bell: <Bell size={26} />, Send: <Send size={26} />, Share2: <Share2 size={26} />,
  Link: <Link size={26} />, Camera: <Camera size={26} />, Video: <Video size={26} />,
  Music: <Music size={26} />, Mic: <Mic size={26} />, Headphones: <Headphones size={26} />,
  Image: <Image size={26} />, Clock: <Clock size={26} />, Calendar: <Calendar size={26} />,
  Timer: <Timer size={26} />, AlarmClock: <AlarmClock size={26} />,
  Check: <Check size={26} />, X: <X size={26} />, AlertTriangle: <AlertTriangle size={26} />,
  Info: <Info size={26} />, HelpCircle: <HelpCircle size={26} />,
  Box: <Box size={26} />, Package: <Package size={26} />, Layers: <Layers size={26} />,
  Grid: <Grid size={26} />, Layout: <Layout size={26} />, Palette: <Palette size={26} />,
  Compass: <Compass size={26} />, Map: <Map size={26} />, Navigation: <Navigation size={26} />,
  Crosshair: <Crosshair size={26} />,
  DollarSign: <DollarSign size={26} />, CreditCard: <CreditCard size={26} />,
  Banknote: <Banknote size={26} />, Coins: <Coins size={26} />, BadgeDollarSign: <BadgeDollarSign size={26} />,
  ThumbsUp: <ThumbsUp size={26} />, ThumbsDown: <ThumbsDown size={26} />,
  Smile: <Smile size={26} />, Frown: <Frown size={26} />, Meh: <Meh size={26} />,
  Eye: <Eye size={26} />, EyeOff: <EyeOff size={26} />, Search: <Search size={26} />,
  Filter: <Filter size={26} />, Settings: <Settings size={26} />, Sliders: <Sliders size={26} />,
  FileText: <FileText size={26} />, FolderOpen: <FolderOpen size={26} />,
  Download: <Download size={26} />, Upload: <Upload size={26} />, Save: <Save size={26} />,
  RefreshCw: <RefreshCw size={26} />, RotateCcw: <RotateCcw size={26} />,
  Maximize: <Maximize size={26} />, Minimize: <Minimize size={26} />, Move: <Move size={26} />,
  Crown: <Crown size={26} />, Diamond: <Diamond size={26} />, Gem: <Gem size={26} />,
  Trophy: <Trophy size={26} />, Medal: <Medal size={26} />,
  Brain: <Brain size={26} />, Sparkles: <Sparkles size={26} />, Wand2: <Wand2 size={26} />,
  Puzzle: <Puzzle size={26} />, CircuitBoard: <CircuitBoard size={26} />,
};

const iconNames = Object.keys(iconMap);

/* ── Types ── */
interface ComparisonItem {
  icon: string;
  name: string;
  descAlanis: string;
  descOutras: string;
  alanisStatus: 'check' | 'cross';
  outrasStatus: 'check' | 'cross';
}

const defaultItems: ComparisonItem[] = [
  { icon: 'Wallet', name: 'Fontes de receita', descAlanis: 'Monetize de 6 formas diferentes', descOutras: 'Apenas taxa sobre vendas', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'BarChart3', name: 'Analytics por aula', descAlanis: 'Saiba onde cada aluno abandona', descOutras: 'Sem dados granulares', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'Users', name: 'Sistema viral de indicação', descAlanis: 'Cada aluno traz novos alunos', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'ShoppingCart', name: 'Commerce dentro da aula', descAlanis: 'Botão de compra automático no vídeo', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'Gift', name: 'Anúncios nativos', descAlanis: 'Receita com anunciantes parceiros', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'Route', name: 'Trilhas de carreira', descAlanis: 'Sequência definida, sem confusão', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'PlayCircle', name: 'Multiformatos', descAlanis: 'Vídeo, áudio, livro, quiz e desafio', descOutras: 'Apenas vídeo (parcial)', alanisStatus: 'check', outrasStatus: 'cross' },
  { icon: 'Flame', name: 'Desafios tipo Duolingo', descAlanis: 'Engajamento gamificado diário', descOutras: 'Não oferece', alanisStatus: 'check', outrasStatus: 'cross' },
];

/* ── Status icon renderer ── */
function StatusIcon({ status, onClick, editable }: { status: 'check' | 'cross'; onClick?: () => void; editable?: boolean }) {
  const [hover, setHover] = useState(false);
  const wrapStyle: React.CSSProperties = editable ? {
    cursor: 'pointer',
    outline: hover ? '1px dashed rgba(117,251,198,0.4)' : 'none',
    outlineOffset: 2, borderRadius: '50%', transition: 'outline 150ms',
  } : {};

  const content = status === 'check' ? (
    <svg className="comp-check-svg" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <polyline points="7 12 10.5 15.5 17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
    </svg>
  ) : (
    <svg className="comp-cross-svg" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="cross-draw" />
      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="cross-draw" />
    </svg>
  );

  if (!editable) return content;

  return (
    <div
      onClick={(ev) => { ev.stopPropagation(); onClick?.(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={wrapStyle}
      title="Clique para alternar ✓/✕"
    >
      {content}
    </div>
  );
}

/* ── Delete button ── */
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

/* ── Icon Picker Modal ── */
function IconPickerModal({ isOpen, currentIcon, onSelect, onClose }: {
  isOpen: boolean; currentIcon: string; onSelect: (name: string) => void; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;

  const filtered = search
    ? iconNames.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : iconNames;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24, width: 440, maxHeight: '70vh', display: 'flex', flexDirection: 'column',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Escolher Ícone</h3>
        <input
          type="text" placeholder="Buscar ícone..." value={search} onChange={e => setSearch(e.target.value)}
          autoFocus
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.9rem', outline: 'none',
            marginBottom: 16, boxSizing: 'border-box',
          }}
        />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6,
          overflowY: 'auto', flex: 1, maxHeight: 320,
        }}>
          {filtered.map(name => (
            <button
              key={name}
              title={name}
              onClick={() => { onSelect(name); onClose(); }}
              style={{
                width: 44, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: name === currentIcon ? 'rgba(117,251,198,0.15)' : 'rgba(255,255,255,0.04)',
                color: name === currentIcon ? '#75fbc6' : 'rgba(255,255,255,0.6)',
                transition: 'all 150ms',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(117,251,198,0.1)'; ev.currentTarget.style.color = '#75fbc6'; }}
              onMouseLeave={ev => { ev.currentTarget.style.background = name === currentIcon ? 'rgba(117,251,198,0.15)' : 'rgba(255,255,255,0.04)'; ev.currentTarget.style.color = name === currentIcon ? '#75fbc6' : 'rgba(255,255,255,0.6)'; }}
            >
              {iconMap[name]}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Clickable icon (edit mode) ── */
function EditableIcon({ iconName, onChangeIcon }: { iconName: string; onChangeIcon: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <>
      <div
        className="comp-feature__icon"
        onClick={(ev) => { ev.stopPropagation(); setOpen(true); }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          cursor: 'pointer',
          outline: hover ? '2px dashed rgba(117,251,198,0.4)' : '2px dashed transparent',
          outlineOffset: 2, borderRadius: 6, transition: 'outline 150ms',
        }}
        title="Clique para trocar ícone"
      >
        {iconMap[iconName] || <Wallet size={26} />}
      </div>
      <IconPickerModal isOpen={open} currentIcon={iconName} onSelect={onChangeIcon} onClose={() => setOpen(false)} />
    </>
  );
}

/* ── Inline editable field ── */
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

  // Editable header texts
  const alanisTagline = src?.comparison_alanis_tagline || 'Plataforma completa';
  const outrasTitle = src?.comparison_outras_title || 'Outras plataformas';
  const outrasTagline = src?.comparison_outras_tagline || 'Funcionalidade limitada';

  // Items: from saved content or defaults
  const items: ComparisonItem[] = (src?.comparison_items || defaultItems).map((item: any) => ({
    ...item,
    // Normalize old pill statuses to check/cross
    alanisStatus: (typeof item.alanisStatus === 'object' || item.alanisStatus === 'check') ? 'check' : 'cross',
    outrasStatus: (typeof item.outrasStatus === 'object' && item.outrasStatus?.color !== 'red')
      ? 'check'
      : (item.outrasStatus === 'check' ? 'check' : 'cross'),
  }));

  // Count scores
  const alanisScore = items.filter(f => f.alanisStatus === 'check').length;
  const outrasScore = items.filter(f => f.outrasStatus === 'check').length;

  const saveItems = (newItems: ComparisonItem[]) => {
    if (edit) edit.updateField('comparison_items', newItems);
  };

  const deleteItem = (index: number) => {
    saveItems(items.filter((_, i) => i !== index));
  };

  const updateItemField = (index: number, field: string, value: any) => {
    saveItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const toggleStatus = (index: number, side: 'alanisStatus' | 'outrasStatus') => {
    const current = items[index][side];
    updateItemField(index, side, current === 'check' ? 'cross' : 'check');
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
              <p className="comp-col__tagline">
                {e ? (
                  <EditableText fieldKey="comparison_alanis_tagline" label="Tagline Alanis">{alanisTagline}</EditableText>
                ) : alanisTagline}
              </p>
            </div>
            <div className="comp-col__body">
              {items.map((f, i) => (
                <div key={i} className="comp-feature" style={{ position: 'relative' }}>
                  {e && <DeleteBtn onClick={() => deleteItem(i)} />}
                  {e ? (
                    <EditableIcon iconName={f.icon} onChangeIcon={(name) => updateItemField(i, 'icon', name)} />
                  ) : (
                    <div className="comp-feature__icon">{iconMap[f.icon] || <Wallet size={26} />}</div>
                  )}
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
                  <div className="comp-feature__status">
                    <StatusIcon status={f.alanisStatus} editable={!!e} onClick={() => toggleStatus(i, 'alanisStatus')} />
                  </div>
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
              <span className="comp-col__title-text">
                {e ? (
                  <EditableText fieldKey="comparison_outras_title" label="Título Outras">{outrasTitle}</EditableText>
                ) : outrasTitle}
              </span>
              <p className="comp-col__tagline">
                {e ? (
                  <EditableText fieldKey="comparison_outras_tagline" label="Tagline Outras">{outrasTagline}</EditableText>
                ) : outrasTagline}
              </p>
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
                  <div className="comp-feature__status">
                    <StatusIcon status={f.outrasStatus} editable={!!e} onClick={() => toggleStatus(i, 'outrasStatus')} />
                  </div>
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
