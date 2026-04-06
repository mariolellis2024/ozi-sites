import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, Eye, MousePointerClick, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';

interface VisitEvent {
  type: string;
  at: string;
}

interface Visit {
  id: number;
  sck: string;
  page_id: number;
  slug: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  src: string | null;
  xcod: string | null;
  fbclid: string | null;
  gclid: string | null;
  ip: string;
  referrer: string | null;
  fbp: string | null;
  fbc: string | null;
  purchased: boolean;
  purchase_data: any;
  purchased_at: string | null;
  created_at: string;
  events: VisitEvent[];
}

function EventBadge({ type }: { type: string }) {
  const configs: Record<string, { bg: string; color: string; icon: any; label: string }> = {
    modal_open: { bg: 'rgba(255,200,50,0.12)', color: '#ffc832', icon: <MousePointerClick size={10} />, label: 'Modal' },
    pix_click: { bg: 'rgba(117,251,198,0.12)', color: '#75fbc6', icon: <CreditCard size={10} />, label: 'Pix' },
    card_click: { bg: 'rgba(110,168,254,0.12)', color: '#6ea8fe', icon: <CreditCard size={10} />, label: 'Cartão' },
  };
  const c = configs[type] || { bg: 'rgba(255,255,255,0.06)', color: '#aaa', icon: null, label: type };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 12,
      background: c.bg, color: c.color, fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
    }}>{c.icon} {c.label}</span>
  );
}

function UtmCell({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>;
  return <span style={{ fontSize: '0.78rem' }}>{value}</span>;
}

export default function AdminTracking() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [slugFilter, setSlugFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchVisits();
  }, [page, slugFilter]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (slugFilter) params.set('slug', slugFilter);
      const res = await fetch(`/api/track/visits?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVisits(data.visits);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  const cellStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: '0.8rem', color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)', verticalAlign: 'top',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="tracking" />

        <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Tracking</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                {total.toLocaleString()} visitas registradas
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={14} style={{ color: 'var(--color-text-light)' }} />
              <input
                value={slugFilter}
                onChange={e => { setSlugFilter(e.target.value); setPage(1); }}
                placeholder="Filtrar por slug..."
                style={{
                  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.85rem', outline: 'none', width: 180,
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)' }}>
                    {['SCK', 'Página', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'SRC', 'XCOD', 'Eventos', 'Compra', 'Data'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--color-text-light)',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} style={{ ...cellStyle, textAlign: 'center', padding: 40 }}>Carregando...</td></tr>
                  ) : visits.length === 0 ? (
                    <tr><td colSpan={10} style={{ ...cellStyle, textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>Nenhuma visita encontrada</td></tr>
                  ) : visits.map(v => (
                    <>
                      <tr
                        key={v.id}
                        onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                        style={{ cursor: 'pointer', transition: 'background 150ms', background: expandedId === v.id ? 'rgba(117,251,198,0.03)' : undefined }}
                      >
                        <td style={{ ...cellStyle, fontFamily: 'monospace', color: '#75fbc6', fontWeight: 600, fontSize: '0.78rem' }}>
                          {v.sck}
                        </td>
                        <td style={cellStyle}>
                          <code style={{ background: 'rgba(117,251,198,0.08)', color: 'var(--color-accent)', padding: '1px 6px', borderRadius: 4, fontSize: '0.78rem' }}>
                            /{v.slug || '—'}
                          </code>
                        </td>
                        <td style={cellStyle}><UtmCell value={v.utm_source} /></td>
                        <td style={cellStyle}><UtmCell value={v.utm_medium} /></td>
                        <td style={cellStyle}><UtmCell value={v.utm_campaign} /></td>
                        <td style={cellStyle}><UtmCell value={v.src} /></td>
                        <td style={cellStyle}><UtmCell value={v.xcod} /></td>
                        <td style={cellStyle}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {v.events.length === 0 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                                <Eye size={10} /> view only
                              </span>
                            ) : (
                              v.events.map((ev, i) => <EventBadge key={i} type={ev.type} />)
                            )}
                          </div>
                        </td>
                        <td style={cellStyle}>
                          {v.purchased ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#75fbc6', fontSize: '0.78rem', fontWeight: 600 }}>
                              <CheckCircle size={13} /> Sim
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>
                              <XCircle size={13} /> Não
                            </span>
                          )}
                        </td>
                        <td style={{ ...cellStyle, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                          {new Date(v.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedId === v.id && (
                        <tr key={`${v.id}-detail`}>
                          <td colSpan={10} style={{ padding: '16px 20px', background: 'rgba(117,251,198,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px 24px', fontSize: '0.78rem' }}>
                              <Detail label="IP" value={v.ip} />
                              <Detail label="Referrer" value={v.referrer} />
                              <Detail label="FBP" value={v.fbp} />
                              <Detail label="FBC" value={v.fbc} />
                              <Detail label="FBCLID" value={v.fbclid} />
                              <Detail label="GCLID" value={v.gclid} />
                              <Detail label="UTM Content" value={v.utm_content} />
                              <Detail label="UTM Term" value={v.utm_term} />
                              {v.purchased && v.purchase_data && (
                                <Detail label="Dados da Compra" value={JSON.stringify(v.purchase_data, null, 2)} />
                              )}
                            </div>
                            {v.events.length > 0 && (
                              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline de eventos</span>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                                  {v.events.map((ev, i) => (
                                    <span key={i} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                      <EventBadge type={ev.type} />{' '}
                                      {new Date(ev.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'transparent', color: page <= 1 ? 'var(--color-text-light)' : '#fff', cursor: page <= 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem',
                }}
              ><ChevronLeft size={14} /> Anterior</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
                  background: 'transparent', color: page >= totalPages ? 'var(--color-text-light)' : '#fff', cursor: page >= totalPages ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem',
                }}
              >Próxima <ChevronRight size={14} /></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span style={{ color: 'var(--color-text-light)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
      <div style={{ color: value ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.15)', marginTop: 2, wordBreak: 'break-all' }}>
        {value || '—'}
      </div>
    </div>
  );
}
