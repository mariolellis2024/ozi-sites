import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, CreditCard, AlertTriangle, Check, ChevronDown, ChevronUp, Link2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';

interface Sale {
  id: number;
  cakto_id: string;
  ref_id: string;
  event: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_doc: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  payment_method: string;
  payment_amount: number;
  payment_currency: string;
  offer_name: string;
  sck: string;
  utm_source: string;
  utm_campaign: string;
  meta_synced: boolean;
  meta_synced_at: string;
  visit_id: number;
  visit_slug: string;
  created_at: string;
}

interface Stats {
  total_approved: number;
  total_pix: number;
  total_abandoned: number;
  total_refunded: number;
  total_synced: number;
  total_revenue: number;
}

export default function AdminSales() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [page, filter]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/sales/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (filter) params.set('event', filter);
      const res = await fetch(`/api/sales?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSales(data.sales);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch { toast.error('Erro ao carregar vendas'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  const fmtCurrency = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    approved: { color: '#75fbc6', bg: 'rgba(117,251,198,0.1)', label: 'Aprovada' },
    pending: { color: '#ffc832', bg: 'rgba(255,200,50,0.1)', label: 'Pix Gerado' },
    abandoned: { color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Abandonada' },
    refunded: { color: '#ff9f43', bg: 'rgba(255,159,67,0.1)', label: 'Reembolsada' },
    chargeback: { color: '#ee5a24', bg: 'rgba(238,90,36,0.1)', label: 'Chargeback' },
    unknown: { color: '#aaa', bg: 'rgba(170,170,170,0.1)', label: 'Desconhecido' },
  };

  const statCards = [
    { label: 'Vendas Aprovadas', value: stats?.total_approved || 0, color: '#75fbc6', icon: <Check size={20} /> },
    { label: 'Receita Total', value: fmtCurrency(Number(stats?.total_revenue || 0)), color: '#75fbc6', icon: <DollarSign size={20} /> },
    { label: 'Pix Gerados', value: stats?.total_pix || 0, color: '#ffc832', icon: <CreditCard size={20} /> },
    { label: 'Abandonos', value: stats?.total_abandoned || 0, color: '#ff6b6b', icon: <AlertTriangle size={20} /> },
    { label: 'Meta Sincronizadas', value: stats?.total_synced || 0, color: '#6ea8fe', icon: <Link2 size={20} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="sales" />

        <main style={{ flex: 1, padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Vendas</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Webhooks recebidos da Cakto em tempo real
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
            {statCards.map((s, i) => (
              <div key={i} style={{
                padding: '16px 20px', borderRadius: 'var(--radius-medium)',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { value: '', label: `Todos (${total})` },
              { value: 'purchase_approved', label: 'Vendas' },
              { value: 'pix_generated', label: 'Pix Gerado' },
              { value: 'checkout_abandonment', label: 'Abandonos' },
            ].map(f => (
              <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                border: filter === f.value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: filter === f.value ? 'rgba(117,251,198,0.08)' : 'transparent',
                color: filter === f.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-body)', fontWeight: 500,
              }}>{f.label}</button>
            ))}
          </div>

          {/* Table */}
          <div style={{
            borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)',
            overflow: 'hidden', background: 'var(--color-bg-secondary)',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 110px 80px 1fr 130px 80px 40px',
              padding: '12px 20px', background: 'rgba(0,0,0,0.2)', gap: 12,
              fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <div>Status</div>
              <div>Cliente</div>
              <div>Valor</div>
              <div>Método</div>
              <div>Produto</div>
              <div>Data</div>
              <div>Meta</div>
              <div></div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Carregando...</div>
            ) : sales.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>
                <ShoppingCart size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p>Nenhuma venda registrada ainda</p>
              </div>
            ) : (
              sales.map(sale => {
                const sc = statusConfig[sale.status] || statusConfig.unknown;
                const expanded = expandedId === sale.id;
                return (
                  <div key={sale.id}>
                    <div
                      style={{
                        display: 'grid', gridTemplateColumns: '120px 1fr 110px 80px 1fr 130px 80px 40px',
                        padding: '14px 20px', gap: 12, alignItems: 'center',
                        borderTop: '1px solid var(--color-border)',
                        cursor: 'pointer', transition: 'background 150ms',
                      }}
                      onClick={() => setExpandedId(expanded ? null : sale.id)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <span style={{
                          padding: '3px 10px', borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem', fontWeight: 600,
                          background: sc.bg, color: sc.color,
                        }}>{sc.label}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sale.customer_name || '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sale.customer_email || '—'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                        {fmtCurrency(sale.payment_amount)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                        {sale.payment_method || '—'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sale.offer_name || '—'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                        {fmtDate(sale.created_at)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: sale.meta_synced ? '#75fbc6' : 'rgba(255,255,255,0.15)',
                          boxShadow: sale.meta_synced ? '0 0 6px rgba(117,251,198,0.4)' : 'none',
                        }} />
                        {sale.visit_id && (
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: '#6ea8fe',
                            boxShadow: '0 0 6px rgba(110,168,254,0.4)',
                          }} title="SCK vinculado" />
                        )}
                      </div>
                      <div style={{ color: 'var(--color-text-light)' }}>
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {expanded && (
                      <div style={{
                        padding: '16px 20px', background: 'rgba(0,0,0,0.15)',
                        borderTop: '1px solid var(--color-border)',
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px',
                        fontSize: '0.78rem',
                      }}>
                        <DetailGroup label="Cliente" items={[
                          ['Nome', sale.customer_name],
                          ['Email', sale.customer_email],
                          ['Telefone', sale.customer_phone],
                          ['CPF/CNPJ', sale.customer_doc],
                        ]} />
                        <DetailGroup label="Localização" items={[
                          ['Cidade', sale.address_city],
                          ['Estado', sale.address_state],
                          ['CEP', sale.address_zip],
                        ]} />
                        <DetailGroup label="Tracking" items={[
                          ['SCK', sale.sck],
                          ['Página', sale.visit_slug],
                          ['UTM Source', sale.utm_source],
                          ['UTM Campaign', sale.utm_campaign],
                        ]} />
                        <DetailGroup label="Pagamento" items={[
                          ['Valor', fmtCurrency(sale.payment_amount)],
                          ['Método', sale.payment_method],
                          ['Cakto ID', sale.cakto_id],
                          ['Ref ID', sale.ref_id],
                        ]} />
                        <DetailGroup label="Meta Sync" items={[
                          ['Status', sale.meta_synced ? '🟢 Sincronizado' : '⚪ Não sincronizado'],
                          ['Sincronizado em', sale.meta_synced_at ? fmtDate(sale.meta_synced_at) : '—'],
                          ['Visit ID', sale.visit_id ? `#${sale.visit_id}` : '—'],
                        ]} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                background: 'transparent', color: 'var(--color-text-secondary)', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', opacity: page <= 1 ? 0.4 : 1,
              }}>Anterior</button>
              <span style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                {page} / {totalPages}
              </span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                background: 'transparent', color: 'var(--color-text-secondary)', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', opacity: page >= totalPages ? 0.4 : 1,
              }}>Próxima</button>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#75fbc6' }} /> Meta Sync
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6ea8fe' }} /> SCK Vinculado
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} /> Sem Sync
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DetailGroup({ label, items }: { label: string; items: [string, any][] }) {
  return (
    <div>
      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
        {label}
      </div>
      {items.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <span style={{ color: 'var(--color-text-light)', minWidth: 80 }}>{k}:</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, wordBreak: 'break-all' }}>{v || '—'}</span>
        </div>
      ))}
    </div>
  );
}
