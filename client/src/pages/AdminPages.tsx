import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, KeyRound, Plus, ExternalLink, Pencil, Trash2, Shield, BarChart3, Settings, Eye, MousePointerClick, Activity, Copy, DollarSign, Timer } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import DeletePageModal from '../components/ui/DeletePageModal';
import RetentionChartModal from '../components/admin/RetentionChartModal';
import { useSiteConfig } from '../context/SiteConfigContext';
import { COLOR_PALETTES } from '../config/colorPalettes';

interface BaseTemplate {
  id: number;
  name: string;
  description: string;
}

interface Page {
  id: number;
  name: string;
  slug: string;
  status: string;
  palette_id?: string;
  base_template_id?: number;
  reveal_seconds?: number;
  created_at: string;
}

/** Format a number compactly: 0, 12, 1.2k, 12.4k, 1.3M */
function fmtNum(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}

function AdminNav({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={useSiteConfig().logo_url} alt="Logo" style={{ height: 28 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 500, borderLeft: '1px solid var(--color-border)', paddingLeft: 12 }}>Admin</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{email}</span>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-small)',
          border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)',
          fontSize: '0.85rem', cursor: 'pointer',
        }}><LogOut size={14} /> Sair</button>
      </div>
    </header>
  );
}

function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <Shield size={18} />, path: '/admin/dashboard' },
    { id: 'pages', label: 'Páginas', icon: <FileText size={18} />, path: '/admin/pages' },
    { id: 'template', label: 'Templates', icon: <Copy size={18} />, path: '/admin/template' },
    { id: 'models', label: 'Modelos Salvos', icon: <Copy size={18} />, path: '/admin/models' },
    { id: 'integrations', label: 'Integrações', icon: <BarChart3 size={18} />, path: '/admin/integrations' },
    { id: 'tracking', label: 'Tracking', icon: <Activity size={18} />, path: '/admin/tracking' },
    { id: 'sales', label: 'Vendas', icon: <DollarSign size={18} />, path: '/admin/sales' },
    { id: 'settings', label: 'Configurações', icon: <Settings size={18} />, path: '/admin/settings' },
    { id: 'password', label: 'Alterar Senha', icon: <KeyRound size={18} />, path: '/admin/password' },
  ];

  return (
    <nav style={{
      width: 220, borderRight: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
      padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => navigate(item.path)} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', width: '100%',
          background: active === item.id ? 'rgba(117, 251, 198, 0.08)' : 'transparent',
          color: active === item.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          border: 'none', borderRight: active === item.id ? '2px solid var(--color-accent)' : '2px solid transparent',
          fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left',
          transition: 'all 200ms ease', fontFamily: 'var(--font-body)',
        }}>{item.icon} {item.label}</button>
      ))}
    </nav>
  );
}

export { AdminNav, AdminSidebar };

function RevealTimerInputs({ initialSeconds, onSave, onCancel }: { initialSeconds: number; onSave: (seconds: number) => void; onCancel: () => void }) {
  const [mins, setMins] = useState(Math.floor(initialSeconds / 60));
  const [secs, setSecs] = useState(initialSeconds % 60);
  const total = mins * 60 + secs;

  const inputStyle: React.CSSProperties = {
    width: 70, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
    background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontSize: '1.1rem',
    fontWeight: 700, textAlign: 'center', fontFamily: 'var(--font-body)',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <input type="number" min={0} max={59} value={mins} onChange={e => setMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} style={inputStyle} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Minutos</span>
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 16 }}>:</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <input type="number" min={0} max={59} value={secs} onChange={e => setSecs(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} style={inputStyle} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Segundos</span>
        </div>
      </div>
      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 20, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {total > 0
          ? <>O conteúdo será revelado após <strong style={{ color: '#fbbf24' }}>{mins > 0 ? `${mins}m ` : ''}{secs > 0 ? `${secs}s` : ''}</strong> de vídeo assistido.</>
          : <>Sem gate — todo o conteúdo será exibido imediatamente.</>
        }
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-border)',
          background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-body)',
        }}>Cancelar</button>
        <button onClick={() => onSave(total)} style={{
          flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
          background: '#fbbf24', color: '#1a1a2e', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-body)',
        }}>Salvar</button>
      </div>
    </div>
  );
}

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [retentionTarget, setRetentionTarget] = useState<{ slug: string; name: string; videoId: string } | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [savingPalette, setSavingPalette] = useState<number | null>(null);
  const [baseTemplates, setBaseTemplates] = useState<BaseTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState(COLOR_PALETTES[0].id);
  const [revealTarget, setRevealTarget] = useState<{ id: number; name: string; reveal_seconds: number } | null>(null);
  const [editingName, setEditingName] = useState<{ id: number; value: string } | null>(null);
  const [editingSlug, setEditingSlug] = useState<{ id: number; value: string } | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<{ id: number; name: string; slug: string } | null>(null);
  const [dupName, setDupName] = useState('');
  const [dupSlug, setDupSlug] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchPages();
    fetchStats();
    fetchBaseTemplates();
  }, []);

  const fetchBaseTemplates = async () => {
    try {
      const res = await fetch('/api/base-templates', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBaseTemplates(data);
        if (data.length > 0) setSelectedTemplateId(data[0].id);
      }
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/track/stats-all', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { navigate('/admin'); return; }
      setPages(await res.json());
    } catch { toast.error('Erro ao carregar páginas'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          base_template_id: selectedTemplateId,
          palette_id: selectedPaletteId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Página criada!');
      setShowCreate(false);
      setNewName('');
      setNewSlug('');
      fetchPages();
    } catch { toast.error('Erro ao criar página'); }
  };

  const handleDeleteOnly = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/pages/${deleteTarget.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Página deletada');
      setDeleteTarget(null);
      fetchPages();
    } catch { toast.error('Erro ao deletar'); }
  };

  const handleSaveAndDelete = async (templateName: string) => {
    if (!deleteTarget) return;
    try {
      // Fetch the full page data first
      const pageRes = await fetch(`/api/pages/${deleteTarget.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!pageRes.ok) throw new Error('Erro ao buscar página');
      const pageData = await pageRes.json();

      // Save as template
      const tplRes = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: templateName,
          content_index: pageData.content_index,
          content_obrigado: pageData.content_obrigado,
        }),
      });
      if (!tplRes.ok) throw new Error('Erro ao salvar modelo');

      // Now delete
      await fetch(`/api/pages/${deleteTarget.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Modelo salvo e página deletada!');
      setDeleteTarget(null);
      fetchPages();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin');
  };

  const handlePaletteChange = async (pageId: number, paletteId: string) => {
    setSavingPalette(pageId);
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ palette_id: paletteId }),
      });
      if (!res.ok) throw new Error();
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, palette_id: paletteId } : p));
      const palette = COLOR_PALETTES.find(c => c.id === paletteId);
      toast.success(`Paleta alterada para ${palette?.name || paletteId}`);
    } catch { toast.error('Erro ao salvar paleta'); }
    finally { setSavingPalette(null); }
  };

  const handleRevealSave = async (pageId: number, seconds: number) => {
    try {
      const res = await fetch(`/api/pages/${pageId}/reveal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reveal_seconds: seconds }),
      });
      if (!res.ok) throw new Error();
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, reveal_seconds: seconds } : p));
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      toast.success(seconds > 0 ? `Gate definido: ${mins}m${secs > 0 ? ` ${secs}s` : ''} de vídeo` : 'Gate removido');
      setRevealTarget(null);
    } catch { toast.error('Erro ao salvar tempo de liberação'); }
  };

  const handleSaveName = async (pageId: number, name: string) => {
    if (!name.trim()) { toast.error('Nome não pode ser vazio'); return; }
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, name: name.trim() } : p));
      setEditingName(null);
      toast.success('Nome atualizado');
    } catch { toast.error('Erro ao salvar nome'); }
  };

  const handleSaveSlug = async (pageId: number, slug: string) => {
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
    if (!clean) { toast.error('Slug inválido'); return; }
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slug: clean }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Erro ao salvar slug'); return; }
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, slug: clean } : p));
      setEditingSlug(null);
      toast.success('Slug atualizado');
    } catch { toast.error('Erro ao salvar slug'); }
  };

  const openDuplicate = (page: Page) => {
    setDuplicateTarget({ id: page.id, name: page.name, slug: page.slug });
    setDupName(`${page.name} (cópia)`);
    setDupSlug(`${page.slug}-copia`);
  };

  const handleTemplateChange = async (pageId: number, templateId: number) => {
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ base_template_id: templateId }),
      });
      if (!res.ok) throw new Error();
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, base_template_id: templateId } : p));
      const tplName = baseTemplates.find(t => t.id === templateId)?.name || '';
      toast.success(`Template alterado para ${tplName}`);
    } catch { toast.error('Erro ao alterar template'); }
  };

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateTarget) return;
    try {
      const res = await fetch(`/api/pages/${duplicateTarget.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: dupName, slug: dupSlug }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Erro ao duplicar'); return; }
      toast.success('Página duplicada!');
      setDuplicateTarget(null);
      fetchPages();
    } catch { toast.error('Erro ao duplicar página'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="pages" />

        <main style={{ flex: 1, padding: 32 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Páginas</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Gerencie suas landing pages
              </p>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Nova Página
            </button>
          </div>

          {/* Pages table */}
          {loading ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Carregando...</p>
          ) : pages.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 60, borderRadius: 'var(--radius-medium)',
              border: '1px dashed var(--color-border)', color: 'var(--color-text-light)',
            }}>
              <FileText size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p>Nenhuma página criada ainda</p>
            </div>
          ) : (
            <div style={{ borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)' }}>
                    {['Nome', 'Slug', 'Status', 'Template', 'Cor', '👁 Visitas', '🖱 Modal', '💳 Pix', '💳 Cartão', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pages.map(page => (
                    <tr key={page.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {editingName?.id === page.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              autoFocus
                              value={editingName.value}
                              onChange={e => setEditingName({ ...editingName, value: e.target.value })}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(page.id, editingName.value); if (e.key === 'Escape') setEditingName(null); }}
                              style={{
                                width: 140, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-accent)',
                                background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)', fontSize: '0.85rem',
                                fontWeight: 600, outline: 'none', fontFamily: 'var(--font-body)',
                              }}
                            />
                            <button onClick={() => handleSaveName(page.id, editingName.value)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: 2 }}>✓</button>
                            <button onClick={() => setEditingName(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', padding: 2 }}>✗</button>
                          </div>
                        ) : (
                          <span onClick={() => setEditingName({ id: page.id, value: page.name })} style={{ cursor: 'pointer', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} title="Clique para editar">
                            {page.name}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {editingSlug?.id === page.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>/</span>
                            <input
                              autoFocus
                              value={editingSlug.value}
                              onChange={e => setEditingSlug({ ...editingSlug, value: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveSlug(page.id, editingSlug.value); if (e.key === 'Escape') setEditingSlug(null); }}
                              style={{
                                width: 120, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-accent)',
                                background: 'rgba(255,255,255,0.04)', color: 'var(--color-accent)', fontSize: '0.85rem',
                                fontWeight: 500, outline: 'none', fontFamily: 'monospace',
                              }}
                            />
                            <button onClick={() => handleSaveSlug(page.id, editingSlug.value)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: 2 }}>✓</button>
                            <button onClick={() => setEditingSlug(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', padding: 2 }}>✗</button>
                          </div>
                        ) : (
                          <code
                            onClick={() => setEditingSlug({ id: page.id, value: page.slug })}
                            style={{ background: 'rgba(117,251,198,0.08)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 4, fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px dashed rgba(117,251,198,0.3)' }}
                            title="Clique para editar"
                          >/{page.slug}</code>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: page.status === 'active' ? 'rgba(117,251,198,0.12)' : 'rgba(255,200,50,0.12)',
                          color: page.status === 'active' ? 'var(--color-accent)' : '#ffc832',
                          padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600,
                        }}>{page.status === 'active' ? 'Ativo' : 'Rascunho'}</span>
                      </td>
                      {/* Template selector */}
                      <td style={{ padding: '14px 12px' }}>
                        <select
                          value={page.base_template_id || 1}
                          onChange={e => handleTemplateChange(page.id, Number(e.target.value))}
                          style={{
                            padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)',
                            background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-secondary)',
                            fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', outline: 'none',
                            fontFamily: 'var(--font-body)', maxWidth: 120,
                          }}
                        >
                          {baseTemplates.map(tpl => (
                            <option key={tpl.id} value={tpl.id} style={{ background: '#1a1a1a', color: '#fff' }}>
                              {tpl.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Palette picker */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                          {COLOR_PALETTES.map(palette => {
                            const isActive = (page.palette_id || 'mint') === palette.id;
                            return (
                              <button
                                key={palette.id}
                                title={palette.name}
                                disabled={savingPalette === page.id}
                                onClick={() => handlePaletteChange(page.id, palette.id)}
                                style={{
                                  width: isActive ? 24 : 20, height: isActive ? 24 : 20, borderRadius: '50%',
                                  border: isActive ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.15)',
                                  background: palette.swatch,
                                  cursor: savingPalette === page.id ? 'wait' : 'pointer',
                                  padding: 0, flexShrink: 0,
                                  transition: 'all 0.2s ease',
                                  boxShadow: isActive ? `0 0 8px ${palette.swatch}60` : 'none',
                                  opacity: savingPalette === page.id ? 0.5 : 1,
                                }}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Eye size={13} style={{ color: 'var(--color-text-light)' }} /> {fmtNum(stats[page.id]?.total_visits)}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MousePointerClick size={13} style={{ color: 'var(--color-text-light)' }} /> {fmtNum(stats[page.id]?.modal_open)}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#75fbc6', fontWeight: 600 }}>
                        {fmtNum(stats[page.id]?.pix_click)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#6ea8fe', fontWeight: 600 }}>
                        {fmtNum(stats[page.id]?.card_click)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => navigate(`/admin/pages/${page.id}/visual/index`)} title="Editar Landing Page" style={{
                            padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(117,251,198,0.25)',
                            background: 'rgba(117,251,198,0.06)', color: 'var(--color-accent)', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4,
                          }}><Pencil size={12} /> Index</button>
                          <button onClick={() => navigate(`/admin/pages/${page.id}/visual/obrigado`)} title="Editar Página de Obrigado" style={{
                            padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(117,251,198,0.25)',
                            background: 'rgba(117,251,198,0.06)', color: 'var(--color-accent)', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4,
                          }}><Pencil size={12} /> Obrigado</button>
                          <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" title="Abrir" style={{
                            padding: '6px 8px', borderRadius: 6, border: '1px solid var(--color-border)',
                            background: 'transparent', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
                          }}><ExternalLink size={14} /></a>
                          <button onClick={() => openDuplicate(page)} title="Duplicar Página" style={{
                            padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(117,251,198,0.25)',
                            background: 'transparent', color: 'var(--color-accent)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                          }}><Copy size={14} /></button>
                          <button onClick={() => setRetentionTarget({ slug: page.slug, name: page.name, videoId: '' })} title="Retenção do Vídeo" style={{
                            padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(117,251,198,0.25)',
                            background: 'transparent', color: 'var(--color-accent)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                          }}><BarChart3 size={14} /></button>
                          {page.base_template_id === 2 && (
                            <button onClick={() => setRevealTarget({ id: page.id, name: page.name, reveal_seconds: page.reveal_seconds || 0 })} title="Tempo de Liberação" style={{
                              padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(251,191,36,0.4)',
                              background: (page.reveal_seconds || 0) > 0 ? 'rgba(251,191,36,0.12)' : 'transparent',
                              color: '#fbbf24', cursor: 'pointer',
                              display: 'flex', alignItems: 'center',
                            }}><Timer size={14} /></button>
                          )}
                          <button onClick={() => setDeleteTarget({ id: page.id, name: page.name })} title="Deletar" style={{
                            padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,107,107,0.3)',
                            background: 'transparent', color: '#ff6b6b', cursor: 'pointer',
                          }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCreate(false)} />
          <div style={{
            position: 'relative', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-large)', padding: 32, maxWidth: 520, width: '90%',
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>Nova Página</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Nome</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="ex: Edição de Vídeo" style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                  background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Slug</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRight: 'none', borderRadius: 'var(--radius-small) 0 0 var(--radius-small)', fontSize: '0.85rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>
                    site.ozi.com.br/
                  </span>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required placeholder="edicao" style={{
                    flex: 1, padding: '12px 16px', borderRadius: '0 var(--radius-small) var(--radius-small) 0', border: '1px solid var(--color-border)',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                  }} />
                </div>
              </div>

              {/* Template selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>Template</label>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(baseTemplates.length, 3)}, 1fr)`, gap: 10 }}>
                  {baseTemplates.map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      style={{
                        padding: '14px 12px', borderRadius: 'var(--radius-small)', cursor: 'pointer',
                        border: selectedTemplateId === tpl.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        background: selectedTemplateId === tpl.id ? 'rgba(117,251,198,0.06)' : 'rgba(255,255,255,0.02)',
                        textAlign: 'center', transition: 'all 0.2s ease', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <Copy size={18} style={{ color: selectedTemplateId === tpl.id ? 'var(--color-accent)' : 'var(--color-text-light)', marginBottom: 6 }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedTemplateId === tpl.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                        {tpl.name}
                      </div>
                      {tpl.description && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: 3 }}>
                          {tpl.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>Paleta de Cores</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {COLOR_PALETTES.map(palette => (
                    <button
                      key={palette.id}
                      type="button"
                      title={palette.name}
                      onClick={() => setSelectedPaletteId(palette.id)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: selectedPaletteId === palette.id ? '3px solid var(--color-text-primary)' : '2px solid var(--color-border)',
                        background: palette.swatchBg, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: selectedPaletteId === palette.id ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: selectedPaletteId === palette.id ? `0 0 12px ${palette.swatch}40` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: palette.swatch }} />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginLeft: 4 }}>
                    {COLOR_PALETTES.find(p => p.id === selectedPaletteId)?.name}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-body)',
                }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar Página</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Page Modal (with save-as-model option) */}
      <DeletePageModal
        isOpen={!!deleteTarget}
        pageName={deleteTarget?.name || ''}
        onDeleteOnly={handleDeleteOnly}
        onSaveAndDelete={handleSaveAndDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Retention Chart Modal */}
      <RetentionChartModal
        isOpen={!!retentionTarget}
        onClose={() => setRetentionTarget(null)}
        slug={retentionTarget?.slug || ''}
        videoId={retentionTarget?.videoId || ''}
        pageName={retentionTarget?.name || ''}
      />

      {/* Reveal Timer Modal */}
      {revealTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setRevealTarget(null)} />
          <div style={{
            position: 'relative', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-large)', padding: 32, maxWidth: 420, width: '90%',
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
              <Timer size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: '#fbbf24' }} />
              Tempo de Liberação
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Defina quanto tempo de vídeo o visitante precisa assistir antes do conteúdo da página ser revelado.
            </p>
            <RevealTimerInputs
              initialSeconds={revealTarget.reveal_seconds}
              onSave={(seconds) => handleRevealSave(revealTarget.id, seconds)}
              onCancel={() => setRevealTarget(null)}
            />
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {duplicateTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setDuplicateTarget(null)} />
          <div style={{
            position: 'relative', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-large)', padding: 32, maxWidth: 480, width: '90%',
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
              <Copy size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--color-accent)' }} />
              Duplicar Página
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
              Criando cópia independente de <strong style={{ color: 'var(--color-text-secondary)' }}>{duplicateTarget.name}</strong>
            </p>
            <form onSubmit={handleDuplicate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Nome</label>
                <input value={dupName} onChange={e => setDupName(e.target.value)} required style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)',
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Slug</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '0.82rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>
                    site.ozi.com.br/
                  </span>
                  <input value={dupSlug} onChange={e => setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required style={{
                    flex: 1, padding: '10px 14px', borderRadius: '0 8px 8px 0', border: '1px solid var(--color-border)',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)', fontSize: '0.9rem',
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setDuplicateTarget(null)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Duplicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
