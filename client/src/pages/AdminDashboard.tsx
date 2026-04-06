import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Eye, MousePointerClick, CreditCard, ShoppingCart, TrendingDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';

interface Page {
  id: number;
  name: string;
  slug: string;
  status: string;
}

interface FunnelStats {
  total_visits: number;
  comprar: number;
  checkout_click: number;
  purchases: number;
}

/** Format number compactly */
function fmtNum(n: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}

/** Calculate conversion rate as percentage */
function convRate(current: number, base: number): string {
  if (!base || !current) return '0%';
  return (current / base * 100).toFixed(1).replace(/\.0$/, '') + '%';
}

export default function AdminDashboard() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    const stored = localStorage.getItem('admin_user');
    if (!stored) { navigate('/admin'); return; }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); navigate('/admin'); }
        else { setUser(JSON.parse(stored)); }
      }).catch(() => navigate('/admin'));

    // Fetch pages list
    fetch('/api/pages', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: Page[]) => {
        setPages(data);
        if (data.length > 0) setSelectedPageId(data[0].id);
      })
      .catch(() => toast.error('Erro ao carregar páginas'));
  }, [navigate]);

  // Fetch stats when page changes
  useEffect(() => {
    if (!selectedPageId || !token) return;
    setLoadingStats(true);
    fetch(`/api/track/stats/${selectedPageId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: FunnelStats) => setStats(data))
      .catch(() => toast.error('Erro ao carregar estatísticas'))
      .finally(() => setLoadingStats(false));
  }, [selectedPageId]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin');
  };

  if (!user) return null;

  const selectedPage = pages.find(p => p.id === selectedPageId);

  // Funnel stages
  const funnelStages = stats ? [
    {
      label: 'Visualizações',
      value: stats.total_visits,
      icon: <Eye size={20} />,
      color: '#818cf8', // indigo
      gradient: 'linear-gradient(135deg, #818cf8, #6366f1)',
    },
    {
      label: 'Clique Comprar',
      value: stats.comprar,
      icon: <MousePointerClick size={20} />,
      color: '#f472b6', // pink
      gradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
    },
    {
      label: 'Pix / Cartão',
      value: stats.checkout_click,
      icon: <CreditCard size={20} />,
      color: '#fbbf24', // amber
      gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    },
    {
      label: 'Compras',
      value: stats.purchases,
      icon: <ShoppingCart size={20} />,
      color: '#75fbc6', // accent green
      gradient: 'linear-gradient(135deg, #75fbc6, #34d399)',
    },
  ] : [];

  const maxValue = funnelStages.length > 0 ? Math.max(...funnelStages.map(s => s.value), 1) : 1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <AdminSidebar active="dashboard" />

        <main style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Page Selector */}
          <div style={{ marginBottom: 16, flexShrink: 0 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Selecionar Página
            </label>
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <button
                id="page-selector"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', fontFamily: 'var(--font-body)',
                  transition: 'border-color 200ms',
                }}
              >
                <span>
                  {selectedPage ? (
                    <>
                      {selectedPage.name}
                      <span style={{ color: 'var(--color-text-light)', fontWeight: 400, marginLeft: 8, fontSize: '0.85rem' }}>/{selectedPage.slug}</span>
                    </>
                  ) : 'Selecione uma página'}
                </span>
                <ChevronDown size={16} style={{ color: 'var(--color-text-light)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-small)', zIndex: 100, maxHeight: 300, overflowY: 'auto',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                }}>
                  {pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => { setSelectedPageId(page.id); setDropdownOpen(false); }}
                      style={{
                        width: '100%', padding: '10px 16px', border: 'none', textAlign: 'left',
                        background: page.id === selectedPageId ? 'rgba(117,251,198,0.08)' : 'transparent',
                        color: page.id === selectedPageId ? 'var(--color-accent)' : 'var(--color-text-primary)',
                        fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = page.id === selectedPageId ? 'rgba(117,251,198,0.12)' : 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = page.id === selectedPageId ? 'rgba(117,251,198,0.08)' : 'transparent')}
                    >
                      <span style={{ fontWeight: 500 }}>{page.name}</span>
                      <span style={{ color: 'var(--color-text-light)', marginLeft: 8, fontSize: '0.8rem' }}>/{page.slug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Funnel Chart */}
          {loadingStats ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-light)',
              background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-border)',
            }}>
              Carregando estatísticas...
            </div>
          ) : stats && funnelStages.length > 0 ? (
            <div style={{
              flex: 1, padding: '20px 24px', borderRadius: 'var(--radius-medium)',
              background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
              display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexShrink: 0 }}>
                <TrendingDown size={18} style={{ color: 'var(--color-accent)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Funil de Conversão</h3>
                {stats.total_visits > 0 && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-light)',
                    background: 'rgba(117,251,198,0.08)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  }}>
                    Taxa geral: {convRate(stats.purchases, stats.total_visits)}
                  </span>
                )}
              </div>

              {/* Funnel Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {funnelStages.map((stage, i) => {
                  const barPercent = Math.max((stage.value / maxValue) * 100, 3);
                  const prevValue = i === 0 ? stage.value : funnelStages[i - 1].value;
                  const dropRate = i > 0 && prevValue > 0
                    ? convRate(stage.value, prevValue)
                    : null;

                  return (
                    <div key={stage.label}>
                      {/* Drop indicator between stages */}
                      {i > 0 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, marginTop: -4,
                          paddingLeft: 36,
                        }}>
                          <div style={{
                            width: 1, height: 10, background: 'var(--color-border)',
                          }} />
                          <span style={{
                            fontSize: '0.7rem', color: 'var(--color-text-light)',
                            background: 'rgba(255,255,255,0.04)', padding: '1px 8px',
                            borderRadius: 'var(--radius-full)',
                          }}>
                            {dropRate} de conversão
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Icon */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 6, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: `${stage.color}15`, color: stage.color,
                        }}>
                          {stage.icon}
                        </div>

                        {/* Bar container */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                            marginBottom: 4,
                          }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              {stage.label}
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: stage.color }}>
                              {fmtNum(stage.value)}
                            </span>
                          </div>

                          {/* Bar */}
                          <div style={{
                            width: '100%', height: 22, borderRadius: 5,
                            background: 'rgba(255,255,255,0.04)', overflow: 'hidden',
                            position: 'relative',
                          }}>
                            <div style={{
                              width: `${barPercent}%`, height: '100%', borderRadius: 6,
                              background: stage.gradient, opacity: 0.85,
                              transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                            }}>
                              {/* Shimmer effect */}
                              <div style={{
                                position: 'absolute', inset: 0, borderRadius: 6,
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                              }} />
                            </div>
                          </div>


                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Cards */}
              {stats.total_visits > 0 && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16,
                  paddingTop: 16, borderTop: '1px solid var(--color-border)', flexShrink: 0,
                }}>
                  {funnelStages.map(stage => (
                    <div key={stage.label} style={{
                      padding: '10px 12px', borderRadius: 'var(--radius-small)',
                      background: `${stage.color}08`, border: `1px solid ${stage.color}20`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stage.color }}>
                        {fmtNum(stage.value)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 4 }}>
                        {stage.label}
                      </div>
                      {stage.value > 0 && stats.total_visits > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: 2, opacity: 0.7 }}>
                          {convRate(stage.value, stats.total_visits)} do total
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {stats.total_visits === 0 && (
                <div style={{
                  textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-light)',
                }}>
                  <Eye size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhuma visita registrada para esta página</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.6 }}>Os dados aparecerão quando visitantes acessarem a página</p>
                </div>
              )}
            </div>
          ) : !selectedPageId ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-light)',
              background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-border)',
            }}>
              Selecione uma página para ver o funil de conversão
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
