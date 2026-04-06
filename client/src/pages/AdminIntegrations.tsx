import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Save, CheckCircle, ExternalLink } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';

export default function AdminIntegrations() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  // GA4 state
  const [measurementId, setMeasurementId] = useState('');
  const [savedGa4, setSavedGa4] = useState('');
  const [savingGa4, setSavingGa4] = useState(false);

  // Meta state
  const [pixelId, setPixelId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [savedPixel, setSavedPixel] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }

    Promise.all([
      fetch('/api/settings/ga4', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/settings/meta', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([ga4Data, metaData]) => {
        const mid = ga4Data.value?.measurement_id || '';
        setMeasurementId(mid);
        setSavedGa4(mid);

        const pid = metaData.value?.pixel_id || '';
        const tok = metaData.value?.access_token || '';
        setPixelId(pid);
        setAccessToken(tok);
        setSavedPixel(pid);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveGa4 = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = measurementId.trim();
    if (clean && !/^G-[A-Z0-9]+$/.test(clean)) {
      toast.error('Formato inválido. Use o formato G-XXXXXXXXXX');
      return;
    }
    setSavingGa4(true);
    try {
      const res = await fetch('/api/settings/ga4', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: { measurement_id: clean } }),
      });
      if (!res.ok) { toast.error('Erro ao salvar'); return; }
      toast.success(clean ? 'GA4 ativado!' : 'GA4 desativado');
      setSavedGa4(clean);
    } catch { toast.error('Erro de conexão'); }
    finally { setSavingGa4(false); }
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = pixelId.trim();
    const cleanToken = accessToken.trim();

    if (cleanId && !/^\d{10,20}$/.test(cleanId)) {
      toast.error('Pixel ID deve ser numérico (10-20 dígitos)');
      return;
    }
    if (cleanId && !cleanToken) {
      toast.error('O Access Token é obrigatório quando o Pixel ID está configurado');
      return;
    }

    setSavingMeta(true);
    try {
      const res = await fetch('/api/settings/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: { pixel_id: cleanId, access_token: cleanToken } }),
      });
      if (!res.ok) { toast.error('Erro ao salvar'); return; }
      toast.success(cleanId ? 'Meta Pixel ativado!' : 'Meta Pixel desativado');
      setSavedPixel(cleanId);
    } catch { toast.error('Erro de conexão'); }
    finally { setSavingMeta(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-small)',
    border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'monospace', letterSpacing: '0.5px',
  };

  const ga4Active = !!savedGa4;
  const metaActive = !!savedPixel;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="integrations" />

        <main style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ marginBottom: 4 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Integrações</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Conecte ferramentas de analytics e marketing
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, alignItems: 'start' }}>
          <div style={{
            borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)', overflow: 'hidden',
          }}>
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
              <StatusBadge active={ga4Active} />
            </div>

            <form onSubmit={handleSaveGa4} style={{ padding: 24 }}>
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

              <TrackingInfo items={[
                'Page views (SPA)', 'Scroll depth', 'CTA clicks', 'Modal open/close',
                'Pix vs Cartão', 'FAQ interactions', 'Video plays', 'Section visibility',
                'Nav clicks', 'Mobile menu', 'Outbound clicks', 'Lead generation',
              ]} />

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {savedGa4 && (
                  <button type="button" onClick={() => setMeasurementId('')} style={{
                    padding: '12px 20px', borderRadius: 'var(--radius-small)', border: '1px solid rgba(255,107,107,0.3)',
                    background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-body)',
                  }}>
                    Desativar
                  </button>
                )}
                <button type="submit" disabled={savingGa4} className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Save size={16} /> {savingGa4 ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
              ⚠️ O tracking NÃO é aplicado nas páginas administrativas (/admin/*). Apenas páginas públicas são rastreadas.
            </div>
          </div>

          {/* ═══════ Meta Pixel + CAPI Card ═══════ */}
          <div style={{
            borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1877F2, #0D65D9)',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" /></svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Meta Pixel + Conversions API</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: '2px 0 0' }}>
                    Dual tracking (browser + servidor) para EMQ máximo
                  </p>
                </div>
              </div>
              <StatusBadge active={metaActive} />
            </div>

            <form onSubmit={handleSaveMeta} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                  Pixel ID
                </label>
                <input
                  value={pixelId}
                  onChange={e => setPixelId(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456789012345"
                  style={inputStyle}
                  disabled={loading}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginTop: 8 }}>
                  Encontre em: Events Manager → Data Sources → seu Pixel → Settings.
                  {' '}
                  <a href="https://business.facebook.com/events_manager2" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    Abrir Events Manager <ExternalLink size={10} />
                  </a>
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                  Access Token (Conversions API)
                </label>
                <textarea
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  disabled={loading}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', marginTop: 8 }}>
                  Gere em: Events Manager → Settings → Conversions API → Generate Access Token.
                </p>
              </div>

              <TrackingInfo items={[
                'PageView (dual)', 'Lead (checkout click)', 'ViewContent',
                'Event deduplication', 'UTMs (source, medium, campaign)', 'Advanced Matching',
                'fbp / fbc cookies', 'IP + User Agent (server)', 'External ID (visitor)',
              ]} />

              {/* Data Quality info */}
              <div style={{
                padding: 16, borderRadius: 'var(--radius-small)',
                background: 'rgba(24,119,242,0.06)', border: '1px solid rgba(24,119,242,0.15)',
                marginTop: 16,
              }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6ea8fe', marginBottom: 8 }}>
                  🎯 Parâmetros enviados para EMQ máximo:
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <div>✓ <strong>event_id</strong> — deduplicação Browser ↔ Server</div>
                  <div>✓ <strong>client_ip_address</strong> — capturado no servidor</div>
                  <div>✓ <strong>client_user_agent</strong> — capturado no servidor</div>
                  <div>✓ <strong>fbp</strong> — Facebook Browser ID (cookie)</div>
                  <div>✓ <strong>fbc</strong> — Facebook Click ID (fbclid)</div>
                  <div>✓ <strong>external_id</strong> — visitante único</div>
                  <div>✓ <strong>UTMs</strong> — utm_source, utm_medium, utm_campaign, utm_content, utm_term</div>
                  <div>✓ <strong>event_source_url</strong> — URL completa</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {savedPixel && (
                  <button type="button" onClick={() => { setPixelId(''); setAccessToken(''); }} style={{
                    padding: '12px 20px', borderRadius: 'var(--radius-small)', border: '1px solid rgba(255,107,107,0.3)',
                    background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-body)',
                  }}>
                    Desativar
                  </button>
                )}
                <button type="submit" disabled={savingMeta} className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Save size={16} /> {savingMeta ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
              🔒 O Access Token é armazenado apenas no servidor e nunca exposto ao browser. Apenas o Pixel ID é enviado ao frontend.
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
      background: active ? 'rgba(117,251,198,0.12)' : 'rgba(255,255,255,0.06)',
      color: active ? 'var(--color-accent)' : 'var(--color-text-light)',
    }}>
      {active ? '● Ativo' : '○ Inativo'}
    </span>
  );
}

function TrackingInfo({ items }: { items: string[] }) {
  return (
    <div style={{
      padding: 16, borderRadius: 'var(--radius-small)', background: 'rgba(117,251,198,0.04)',
      border: '1px solid rgba(117,251,198,0.1)',
    }}>
      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: 10 }}>
        O que será rastreado:
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
        {items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            <CheckCircle size={12} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
