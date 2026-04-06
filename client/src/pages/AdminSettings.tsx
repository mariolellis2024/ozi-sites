import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, KeyRound, Shield, BarChart3, LayoutTemplate, Settings, Upload, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useSiteConfig } from '../context/SiteConfigContext';

/* ─── Admin Nav ─── */
function AdminNav({ email, onLogout }: { email: string; onLogout: () => void }) {
  const { logo_url } = useSiteConfig();
  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={logo_url} alt="Logo" style={{ height: 28 }} />
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

/* ─── Admin Sidebar ─── */
function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <Shield size={18} />, path: '/admin/dashboard' },
    { id: 'pages', label: 'Páginas', icon: <FileText size={18} />, path: '/admin/pages' },
    { id: 'template', label: 'Modelo Base', icon: <LayoutTemplate size={18} />, path: '/admin/template' },
    { id: 'integrations', label: 'Integrações', icon: <BarChart3 size={18} />, path: '/admin/integrations' },
    { id: 'settings', label: 'Configurações', icon: <Settings size={18} />, path: '/admin/settings' },
    { id: 'password', label: 'Alterar Senha', icon: <KeyRound size={18} />, path: '/admin/dashboard' },
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
          border: 'none', color: active === item.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          cursor: 'pointer', fontSize: '0.88rem', fontWeight: active === item.id ? 600 : 400,
          borderRight: active === item.id ? '2px solid var(--color-accent)' : '2px solid transparent',
          fontFamily: 'var(--font-body)',
        }}>{item.icon} {item.label}</button>
      ))}
    </nav>
  );
}

/* ─── Image Upload Field ─── */
function ImageField({ label, currentUrl, onUpload }: { label: string; currentUrl: string; onUpload: (file: File) => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { await onUpload(file); toast.success(`${label} atualizado!`); }
    catch { toast.error('Erro no upload'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 12 }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: 20, borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <img src={currentUrl} alt={label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(117,251,198,0.3)',
            background: 'rgba(117,251,198,0.08)', color: '#75fbc6', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-body)', opacity: uploading ? 0.5 : 1,
          }}>
            <Upload size={14} /> {uploading ? 'Enviando...' : 'Trocar'}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>PNG, WebP ou SVG</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminSettings() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('/images/logo.webp');
  const [faviconUrl, setFaviconUrl] = useState('/images/favicon.webp');
  const [siteTitle, setSiteTitle] = useState('Alanis | A Área de Membros do Futuro');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    // Decode email from JWT
    try { setEmail(JSON.parse(atob(token.split('.')[1])).email); } catch { /* */ }

    // Load current config
    fetch('/api/settings/site_config', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.value) {
          setLogoUrl(data.value.logo_url || '/images/logo.webp');
          setFaviconUrl(data.value.favicon_url || '/images/favicon.webp');
          setSiteTitle(data.value.site_title || 'Alanis | A Área de Membros do Futuro');
        }
      })
      .catch(() => { /* use defaults */ });
  }, [token, navigate]);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url;
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/site_config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: { logo_url: logoUrl, favicon_url: faviconUrl, site_title: siteTitle } }),
      });
      toast.success('Configurações salvas!');
      // Apply immediately
      document.title = siteTitle;
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link) link.href = faviconUrl;
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/admin'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-primary)' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={email} onLogout={handleLogout} />
      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="settings" />
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: 720 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Configurações</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 40 }}>
            Personalize a identidade visual do seu site
          </p>

          <ImageField
            label="Logo"
            currentUrl={logoUrl}
            onUpload={async (file) => { const url = await uploadFile(file); setLogoUrl(url); }}
          />

          <ImageField
            label="Favicon"
            currentUrl={faviconUrl}
            onUpload={async (file) => { const url = await uploadFile(file); setFaviconUrl(url); }}
          />

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 12 }}>Título do Site</label>
            <input
              value={siteTitle}
              onChange={e => setSiteTitle(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)',
                boxSizing: 'border-box',
              }}
              placeholder="Ex: Alanis | A Área de Membros do Futuro"
            />
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
              Aparece na aba do navegador e nos resultados de busca
            </p>
          </div>

          <button onClick={saveConfig} disabled={saving} style={{
            padding: '12px 28px', borderRadius: 8, border: 'none',
            background: '#75fbc6', color: '#1a1a1a', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-body)', opacity: saving ? 0.6 : 1,
          }}>
            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </main>
      </div>
    </div>
  );
}
