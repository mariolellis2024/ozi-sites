import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';

interface PageData {
  id: number;
  name: string;
  slug: string;
  status: string;
  content_index: {
    seo_title: string;
    seo_description: string;
    hero_title: string;
    hero_subtitle: string;
    hero_image: string;
    cta_text: string;
    pix_link: string;
    pix_price: string;
    pix_detail: string;
    card_link: string;
    card_price: string;
    card_detail: string;
  };
  content_obrigado: {
    title: string;
    subtitle: string;
    message: string;
    cta_text: string;
    cta_link: string;
  };
}

export default function AdminPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const [page, setPage] = useState<PageData | null>(null);
  const [activeTab, setActiveTab] = useState<'index' | 'obrigado'>('index');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetch(`/api/pages/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setPage)
      .catch(() => { toast.error('Página não encontrada'); navigate('/admin/pages'); });
  }, [id]);

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: page.name,
          slug: page.slug,
          status: page.status,
          content_index: page.content_index,
          content_obrigado: page.content_obrigado,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Salvo!');
      setPage(data);
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const updateIndex = (key: string, value: string) => {
    if (!page) return;
    setPage({ ...page, content_index: { ...page.content_index, [key]: value } });
  };

  const updateObrigado = (key: string, value: string) => {
    if (!page) return;
    setPage({ ...page, content_obrigado: { ...page.content_obrigado, [key]: value } });
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  if (!page) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-small)',
    border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)',
    marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  const cardStyle: React.CSSProperties = {
    padding: 24, borderRadius: 'var(--radius-medium)', background: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)', marginBottom: 20,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="pages" />

        <main style={{ flex: 1, padding: 32, maxWidth: 800 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => navigate('/admin/pages')} style={{
                padding: '8px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer',
              }}><ArrowLeft size={16} /></button>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{page.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <code style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>/{page.slug}</code>
                  <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-light)' }}>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Status toggle */}
              <select
                value={page.status}
                onChange={e => setPage({ ...page, status: e.target.value })}
                style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="active">Ativo</option>
                <option value="draft">Rascunho</option>
              </select>
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
            {(['index', 'obrigado'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '12px 24px', border: 'none', background: 'transparent', cursor: 'pointer',
                color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === tab ? 600 : 400, fontSize: '0.9rem',
                borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                marginBottom: -1, fontFamily: 'var(--font-body)',
              }}>
                {tab === 'index' ? '🏠 Landing Page' : '✅ Obrigado'}
              </button>
            ))}
          </div>

          {/* Index fields */}
          {activeTab === 'index' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={16} style={{ color: 'var(--color-accent)' }} /> SEO
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={labelStyle}>Título da aba</label><input style={inputStyle} value={page.content_index.seo_title} onChange={e => updateIndex('seo_title', e.target.value)} /></div>
                  <div><label style={labelStyle}>Meta Description</label><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={page.content_index.seo_description} onChange={e => updateIndex('seo_description', e.target.value)} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>🎯 Hero</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={labelStyle}>Título (aceita HTML)</label><textarea style={{ ...inputStyle, minHeight: 60 }} value={page.content_index.hero_title} onChange={e => updateIndex('hero_title', e.target.value)} /></div>
                  <div><label style={labelStyle}>Subtítulo</label><textarea style={{ ...inputStyle, minHeight: 80 }} value={page.content_index.hero_subtitle} onChange={e => updateIndex('hero_subtitle', e.target.value)} /></div>
                  <div><label style={labelStyle}>Imagem do Hero</label><input style={inputStyle} value={page.content_index.hero_image} onChange={e => updateIndex('hero_image', e.target.value)} /></div>
                  <div><label style={labelStyle}>Texto do CTA</label><input style={inputStyle} value={page.content_index.cta_text} onChange={e => updateIndex('cta_text', e.target.value)} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>💳 Pagamento</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>Link Pix</label><input style={inputStyle} value={page.content_index.pix_link} onChange={e => updateIndex('pix_link', e.target.value)} /></div>
                  <div><label style={labelStyle}>Preço Pix</label><input style={inputStyle} value={page.content_index.pix_price} onChange={e => updateIndex('pix_price', e.target.value)} /></div>
                  <div><label style={labelStyle}>Detalhe Pix</label><input style={inputStyle} value={page.content_index.pix_detail} onChange={e => updateIndex('pix_detail', e.target.value)} /></div>
                  <div />
                  <div><label style={labelStyle}>Link Cartão</label><input style={inputStyle} value={page.content_index.card_link} onChange={e => updateIndex('card_link', e.target.value)} /></div>
                  <div><label style={labelStyle}>Preço Cartão</label><input style={inputStyle} value={page.content_index.card_price} onChange={e => updateIndex('card_price', e.target.value)} /></div>
                  <div><label style={labelStyle}>Detalhe Cartão</label><input style={inputStyle} value={page.content_index.card_detail} onChange={e => updateIndex('card_detail', e.target.value)} /></div>
                </div>
              </div>
            </>
          )}

          {/* Obrigado fields */}
          {activeTab === 'obrigado' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>✅ Página de Obrigado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>Título (aceita HTML)</label><input style={inputStyle} value={page.content_obrigado.title} onChange={e => updateObrigado('title', e.target.value)} /></div>
                <div><label style={labelStyle}>Subtítulo (aceita HTML)</label><input style={inputStyle} value={page.content_obrigado.subtitle} onChange={e => updateObrigado('subtitle', e.target.value)} /></div>
                <div><label style={labelStyle}>Mensagem (aceita HTML)</label><textarea style={{ ...inputStyle, minHeight: 60 }} value={page.content_obrigado.message} onChange={e => updateObrigado('message', e.target.value)} /></div>
                <div><label style={labelStyle}>Texto do botão</label><input style={inputStyle} value={page.content_obrigado.cta_text} onChange={e => updateObrigado('cta_text', e.target.value)} /></div>
                <div><label style={labelStyle}>Link do botão</label><input style={inputStyle} value={page.content_obrigado.cta_link} onChange={e => updateObrigado('cta_link', e.target.value)} /></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
