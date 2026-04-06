import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Globe, Copy, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';
import TemplatePreviewModal from '../components/ui/TemplatePreviewModal';

interface TemplateData {
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

export default function AdminTemplate() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [activeTab, setActiveTab] = useState<'index' | 'obrigado'>('index');
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'index' | 'obrigado'>('index');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetch('/api/settings/page_template', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setTemplate(data.value || {}))
      .catch(() => toast.error('Erro ao carregar template'));
  }, []);

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/page_template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: template }),
      });
      if (!res.ok) { toast.error('Erro ao salvar'); return; }
      toast.success('Modelo base salvo!');
    } catch { toast.error('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const updateIndex = (key: string, value: string) => {
    if (!template) return;
    setTemplate({ ...template, content_index: { ...template.content_index, [key]: value } });
  };

  const updateObrigado = (key: string, value: string) => {
    if (!template) return;
    setTemplate({ ...template, content_obrigado: { ...template.content_obrigado, [key]: value } });
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  if (!template) return null;

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
        <AdminSidebar active="template" />

        <main style={{ flex: 1, padding: 32, maxWidth: 800 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Templates</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Template usado como base ao criar novas páginas
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setPreviewType('index'); setPreviewOpen(true); }} style={{
                padding: '8px 14px', borderRadius: 'var(--radius-small)',
                border: '1px solid rgba(117,251,198,0.2)', background: 'rgba(117,251,198,0.04)',
                color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.82rem',
                fontWeight: 600, fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Eye size={14} /> Preview Index
              </button>
              <button onClick={() => { setPreviewType('obrigado'); setPreviewOpen(true); }} style={{
                padding: '8px 14px', borderRadius: 'var(--radius-small)',
                border: '1px solid rgba(117,180,251,0.2)', background: 'rgba(117,180,251,0.04)',
                color: '#75b4fb', cursor: 'pointer', fontSize: '0.82rem',
                fontWeight: 600, fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Eye size={14} /> Preview Obrigado
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* Info banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', marginBottom: 24,
            borderRadius: 'var(--radius-small)', background: 'rgba(117,251,198,0.06)',
            border: '1px solid rgba(117,251,198,0.15)', fontSize: '0.82rem', color: 'var(--color-text-secondary)',
          }}>
            <Copy size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            Toda nova página criada clona este modelo. Alterações aqui NÃO afetam páginas já existentes.
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
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={16} style={{ color: 'var(--color-accent)' }} /> SEO
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={labelStyle}>Título da aba</label><input style={inputStyle} value={template.content_index.seo_title} onChange={e => updateIndex('seo_title', e.target.value)} /></div>
                  <div><label style={labelStyle}>Meta Description</label><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={template.content_index.seo_description} onChange={e => updateIndex('seo_description', e.target.value)} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>🎯 Hero</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={labelStyle}>Título (aceita HTML)</label><textarea style={{ ...inputStyle, minHeight: 60 }} value={template.content_index.hero_title} onChange={e => updateIndex('hero_title', e.target.value)} /></div>
                  <div><label style={labelStyle}>Subtítulo</label><textarea style={{ ...inputStyle, minHeight: 80 }} value={template.content_index.hero_subtitle} onChange={e => updateIndex('hero_subtitle', e.target.value)} /></div>
                  <div><label style={labelStyle}>Imagem do Hero</label><input style={inputStyle} value={template.content_index.hero_image} onChange={e => updateIndex('hero_image', e.target.value)} /></div>
                  <div><label style={labelStyle}>Texto do CTA</label><input style={inputStyle} value={template.content_index.cta_text} onChange={e => updateIndex('cta_text', e.target.value)} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>💳 Pagamento</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={labelStyle}>Link Pix</label><input style={inputStyle} value={template.content_index.pix_link} onChange={e => updateIndex('pix_link', e.target.value)} /></div>
                  <div><label style={labelStyle}>Preço Pix</label><input style={inputStyle} value={template.content_index.pix_price} onChange={e => updateIndex('pix_price', e.target.value)} /></div>
                  <div><label style={labelStyle}>Detalhe Pix</label><input style={inputStyle} value={template.content_index.pix_detail} onChange={e => updateIndex('pix_detail', e.target.value)} /></div>
                  <div />
                  <div><label style={labelStyle}>Link Cartão</label><input style={inputStyle} value={template.content_index.card_link} onChange={e => updateIndex('card_link', e.target.value)} /></div>
                  <div><label style={labelStyle}>Preço Cartão</label><input style={inputStyle} value={template.content_index.card_price} onChange={e => updateIndex('card_price', e.target.value)} /></div>
                  <div><label style={labelStyle}>Detalhe Cartão</label><input style={inputStyle} value={template.content_index.card_detail} onChange={e => updateIndex('card_detail', e.target.value)} /></div>
                </div>
              </div>
            </>
          )}

          {/* Obrigado fields */}
          {activeTab === 'obrigado' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>✅ Página de Obrigado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>Título (aceita HTML)</label><input style={inputStyle} value={template.content_obrigado.title} onChange={e => updateObrigado('title', e.target.value)} /></div>
                <div><label style={labelStyle}>Subtítulo (aceita HTML)</label><input style={inputStyle} value={template.content_obrigado.subtitle} onChange={e => updateObrigado('subtitle', e.target.value)} /></div>
                <div><label style={labelStyle}>Mensagem (aceita HTML)</label><textarea style={{ ...inputStyle, minHeight: 60 }} value={template.content_obrigado.message} onChange={e => updateObrigado('message', e.target.value)} /></div>
                <div><label style={labelStyle}>Texto do botão</label><input style={inputStyle} value={template.content_obrigado.cta_text} onChange={e => updateObrigado('cta_text', e.target.value)} /></div>
                <div><label style={labelStyle}>Link do botão</label><input style={inputStyle} value={template.content_obrigado.cta_link} onChange={e => updateObrigado('cta_link', e.target.value)} /></div>
              </div>
            </div>
          )}
        </main>
      </div>

      <TemplatePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateId="base"
        templateName="Template Base"
        previewType={previewType}
      />
    </div>
  );
}
