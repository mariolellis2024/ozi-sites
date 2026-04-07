import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, Eye, MousePointerClick, CreditCard, CheckCircle, XCircle, Send, ShoppingCart } from 'lucide-react';
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
  geo_city: string | null;
  geo_state: string | null;
  geo_zip: string | null;
  geo_country: string | null;
  geo_isp: string | null;
  geo_lat: number | null;
  geo_lon: number | null;
  geo_source: string | null;
  created_at: string;
  events: VisitEvent[];
  meta_synced: boolean | null;
  meta_synced_at: string | null;
}

function EventBadge({ type }: { type: string }) {
  const configs: Record<string, { bg: string; color: string; icon: any; label: string }> = {
    page_view: { bg: 'rgba(160,160,255,0.12)', color: '#a0a0ff', icon: <Eye size={10} />, label: 'Visualização' },
    comprar: { bg: 'rgba(255,200,50,0.12)', color: '#ffc832', icon: <MousePointerClick size={10} />, label: 'Comprar' },
    modal_open: { bg: 'rgba(255,200,50,0.12)', color: '#ffc832', icon: <MousePointerClick size={10} />, label: 'Comprar' },
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
  const [purchasedOnly, setPurchasedOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchVisits();
  }, [page, slugFilter, purchasedOnly]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (slugFilter) params.set('slug', slugFilter);
      if (purchasedOnly) params.set('purchased', 'true');
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
              <button
                onClick={() => { setPurchasedOnly(!purchasedOnly); setPage(1); }}
                title={purchasedOnly ? 'Mostrando apenas vendas' : 'Filtrar por vendas'}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: purchasedOnly ? '1px solid rgba(117,251,198,0.4)' : '1px solid var(--color-border)',
                  background: purchasedOnly ? 'rgba(117,251,198,0.1)' : 'transparent',
                  color: purchasedOnly ? '#75fbc6' : 'var(--color-text-secondary)',
                  cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                }}
              >
                <ShoppingCart size={13} />
                {purchasedOnly ? 'Vendas ✓' : 'Vendas'}
              </button>
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
                    {['SCK', 'Página', 'Localização', 'UTM Source', 'UTM Campaign', 'SRC', 'Eventos', 'Compra', 'Meta', 'Data'].map(h => (
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
                        <td style={cellStyle}>
                          {v.geo_city ? (
                            <div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{v.geo_city}, {v.geo_state || '?'}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <div style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: v.geo_source === 'cakto' ? '#75fbc6' : '#ffc832',
                                }} />
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>
                                  {v.geo_source === 'cakto' ? 'Cakto' : 'IP'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.15)' }}>—</span>
                          )}
                        </td>
                        <td style={cellStyle}><UtmCell value={v.utm_source} /></td>
                        <td style={cellStyle}><UtmCell value={v.utm_campaign} /></td>
                        <td style={cellStyle}><UtmCell value={v.src} /></td>
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
                        <td style={cellStyle}>
                          {v.meta_synced ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#75fbc6', fontSize: '0.72rem', fontWeight: 600 }}
                              title={v.meta_synced_at ? `Sincronizado em ${new Date(v.meta_synced_at).toLocaleString('pt-BR')}` : 'Sincronizado'}
                            >
                              <Send size={12} /> Enviado
                            </span>
                          ) : v.purchased ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#ffa64d', fontSize: '0.72rem' }}
                              title="Compra registrada mas Meta CAPI não sincronizou"
                            >
                              <XCircle size={12} /> Pendente
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.72rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ ...cellStyle, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                          {new Date(v.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedId === v.id && (() => {
                        // Extract PII from purchase_data if available
                        const pd = v.purchase_data || {};
                        const params = [
                          { label: 'client_ip_address', value: v.ip, weight: 'alto' as const, score: 1 },
                          { label: 'client_user_agent', value: 'Capturado no servidor', weight: 'alto' as const, score: 1 },
                          { label: 'fbp (Browser ID)', value: v.fbp, weight: 'alto' as const, score: 1.5 },
                          { label: 'fbc (Click ID)', value: v.fbc, weight: 'alto' as const, score: 1.5 },
                          { label: 'em (Email)', value: pd.email || null, weight: 'alto' as const, score: 1.5 },
                          { label: 'ph (Telefone)', value: pd.phone || null, weight: 'alto' as const, score: 1 },
                          { label: 'external_id', value: v.sck, weight: 'medio' as const, score: 0.5 },
                          { label: 'fn (Nome)', value: pd.first_name || null, weight: 'medio' as const, score: 0.5 },
                          { label: 'ln (Sobrenome)', value: pd.last_name || null, weight: 'medio' as const, score: 0.5 },
                          { label: 'ct (Cidade)', value: pd.city || v.geo_city || null, weight: 'baixo' as const, score: 0.25 },
                          { label: 'st (Estado)', value: pd.state || v.geo_state || null, weight: 'baixo' as const, score: 0.25 },
                          { label: 'zp (CEP)', value: pd.zip || v.geo_zip || null, weight: 'baixo' as const, score: 0.25 },
                          { label: 'country (País)', value: pd.country || v.geo_country || null, weight: 'baixo' as const, score: 0.25 },
                        ];
                        const totalScore = params.reduce((sum, p) => sum + (p.value ? p.score : 0), 0);
                        const maxScore = params.reduce((sum, p) => sum + p.score, 0);
                        const emq = Math.min(10, Math.round((totalScore / maxScore) * 10));
                        const emqColor = emq >= 8 ? '#75fbc6' : emq >= 6 ? '#ffc832' : '#ff6b6b';

                        const weightColors = { alto: '#ff6b6b', medio: '#ffc832', baixo: '#6ea8fe' };
                        const weightLabels = { alto: 'ALTO', medio: 'MÉDIO', baixo: 'BAIXO' };

                        return (
                        <tr key={`${v.id}-detail`}>
                          <td colSpan={9} style={{ padding: '20px 24px', background: 'rgba(117,251,198,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                            {/* EMQ Score Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Parâmetros Meta — Event Match Quality
                              </span>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px',
                                borderRadius: 12, background: `${emqColor}15`, border: `1px solid ${emqColor}30`,
                              }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: emqColor }}>EMQ Estimado</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: emqColor }}>{emq}/10</span>
                              </div>
                            </div>

                            {/* Parameters Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
                              {params.map(p => (
                                <div key={p.label} style={{
                                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                  borderRadius: 8, background: p.value ? 'rgba(117,251,198,0.04)' : 'rgba(255,255,255,0.015)',
                                  border: `1px solid ${p.value ? 'rgba(117,251,198,0.1)' : 'rgba(255,255,255,0.04)'}`,
                                }}>
                                  {p.value ? (
                                    <CheckCircle size={14} style={{ color: '#75fbc6', flexShrink: 0 }} />
                                  ) : (
                                    <XCircle size={14} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                                  )}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.value ? 'var(--color-text-primary)' : 'var(--color-text-light)' }}>
                                        {p.label}
                                      </span>
                                      <span style={{
                                        fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                                        background: `${weightColors[p.weight]}18`, color: weightColors[p.weight],
                                        letterSpacing: '0.5px',
                                      }}>{weightLabels[p.weight]}</span>
                                    </div>
                                    <div style={{
                                      fontSize: '0.72rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                      color: p.value ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.12)',
                                    }}>
                                      {p.value || 'Não disponível'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* UTMs + Extra tracking */}
                            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Dados de campanha
                              </span>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 20px', marginTop: 8, fontSize: '0.78rem' }}>
                                <Detail label="Referrer" value={v.referrer} />
                                <Detail label="FBCLID" value={v.fbclid} />
                                <Detail label="GCLID" value={v.gclid} />
                                <Detail label="UTM Content" value={v.utm_content} />
                                <Detail label="UTM Term" value={v.utm_term} />
                              </div>
                            </div>

                            {/* Events Timeline */}
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

                            {/* Meta Events sent to Facebook */}
                            {v.events.length > 0 && (() => {
                              const metaEvents: { name: string; time: string; color: string }[] = [];
                              for (const ev of v.events) {
                                if (ev.type === 'page_view') {
                                  metaEvents.push({ name: 'PageView', time: new Date(ev.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), color: '#a0a0ff' });
                                }
                                if (ev.type === 'pix_click' || ev.type === 'card_click') {
                                  metaEvents.push({ name: 'InitiateCheckout', time: new Date(ev.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), color: '#ffc832' });
                                }
                              }
                              if (v.meta_synced) {
                                metaEvents.push({ name: 'Purchase', time: v.meta_synced_at ? new Date(v.meta_synced_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—', color: '#75fbc6' });
                              }
                              if (metaEvents.length === 0) return null;
                              return (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Eventos enviados ao Meta
                                  </span>
                                  <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                                    {metaEvents.map((me, i) => (
                                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem' }}>
                                        <span style={{
                                          display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 12,
                                          background: 'rgba(66,103,178,0.12)', color: me.color, fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
                                        }}>
                                          <Send size={9} /> {me.name}
                                        </span>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>{me.time}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                        </tr>
                        );
                      })()}
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
