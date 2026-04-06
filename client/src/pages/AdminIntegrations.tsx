import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Save, CheckCircle, ExternalLink } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';

export default function AdminIntegrations() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const [measurementId, setMeasurementId] = useState('');
  const [savedId, setSavedId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetch('/api/settings/ga4', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const mid = data.value?.measurement_id || '';
        setMeasurementId(mid);
        setSavedId(mid);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const clean = measurementId.trim();
    if (clean && !/^G-[A-Z0-9]+$/.test(clean)) {
      toast.error('Formato inválido. Use o formato G-XXXXXXXXXX');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings/ga4', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: { measurement_id: clean } }),
      });
      if (!res.ok) { toast.error('Erro ao salvar'); return; }
      toast.success(clean ? 'GA4 ativado!' : 'GA4 desativado');
      setSavedId(clean);
    } catch { toast.error('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-small)',
    border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'monospace', letterSpacing: '0.5px',
  };

  const isActive = !!savedId;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="integrations" />

        <main style={{ flex: 1, padding: 32, maxWidth: 700 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Integrações</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Conecte ferramentas de analytics e marketing
            </p>
          </div>

          {/* GA4 Card */}
          <div style={{
            borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #F9AB00, #E37400)',
                }}>
                  <BarChart3 size={22} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Google Analytics 4</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: '2px 0 0' }}>
                    Tracking completo de páginas e eventos
                  </p>
                </div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                background: isActive ? 'rgba(117,251,198,0.12)' : 'rgba(255,255,255,0.06)',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-light)',
              }}>
                {isActive ? '● Ativo' : '○ Inativo'}
              </span>
            </div>

            {/* Body */}
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                  ID da Métrica (Measurement ID)
                </label>
                <input
                  value={measurementId}
                  onChange={e => setMeasurementId(e.target.value.toUpperCase())}
                  placeholder="G-XXXXXXXXXX"
                  style={inputStyle}
                  disabled={loading}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginTop: 8 }}>
                  Encontre em: GA4 → Admin → Data Streams → selecione sua stream → Measurement ID.
                  {' '}
                  <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    Abrir GA4 <ExternalLink size={10} />
                  </a>
                </p>
              </div>

              {/* What gets tracked */}
              <div style={{
                padding: 16, borderRadius: 'var(--radius-small)', background: 'rgba(117,251,198,0.04)',
                border: '1px solid rgba(117,251,198,0.1)', marginBottom: 20,
              }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: 10 }}>
                  O que será rastreado:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  {[
                    'Page views (SPA)',
                    'Scroll depth',
                    'CTA clicks',
                    'Modal open/close',
                    'Pix vs Cartão',
                    'FAQ interactions',
                    'Video plays',
                    'Section visibility',
                    'Nav clicks',
                    'Mobile menu',
                    'Outbound clicks',
                    'Lead generation',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      <CheckCircle size={12} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {savedId && (
                  <button type="button" onClick={() => { setMeasurementId(''); }} style={{
                    padding: '12px 20px', borderRadius: 'var(--radius-small)', border: '1px solid rgba(255,107,107,0.3)',
                    background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-body)',
                  }}>
                    Desativar
                  </button>
                )}
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

            {/* Info footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
              ⚠️ O tracking NÃO é aplicado nas páginas administrativas (/admin/*). Apenas páginas públicas são rastreadas.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
