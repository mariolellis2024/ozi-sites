import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingDown, BarChart3, Clock, XCircle, Database, RefreshCw } from 'lucide-react';

interface Segment {
  position: number;
  value: number;
  timestamp: string;
}

interface DropOffPoint {
  position: number;
  severity: string;
  timestamp: string;
  drop: number;
}

interface RetentionData {
  source: string;
  engagementScore: number;
  videoDuration: number;
  segments: Segment[];
  dropOffPoints: DropOffPoint[];
  noData?: boolean;
  message?: string;
  cachedAt?: number;
  uniqueViewers?: number;
}

interface RetentionChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  videoId: string;
  pageName: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #444', borderRadius: 8,
      padding: '6px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#fff', fontSize: 11, fontWeight: 700, margin: 0 }}>{data.timestamp}</p>
      <p style={{ color: '#75fbc6', fontSize: 13, fontWeight: 700, margin: 0 }}>{data.value}% retenção</p>
    </div>
  );
};

export default function RetentionChartModal({ isOpen, onClose, slug, videoId, pageName }: RetentionChartModalProps) {
  const [data, setData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/retention/cache?slug=${encodeURIComponent(slug)}&videoId=${encodeURIComponent(videoId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (!result || result.noData) {
        setData({ source: 'none', engagementScore: 0, videoDuration: 0, segments: [], dropOffPoints: [], noData: true, message: result?.message || 'Nenhum dado disponível.' });
        return;
      }
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [slug, videoId, token]);

  const handleSync = useCallback(async () => {
    try {
      setSyncing(true);
      await fetch('/api/retention/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Erro na sincronização');
    } finally {
      setSyncing(false);
    }
  }, [fetchData, token]);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, fetchData]);

  const referenceLines = useMemo(() => {
    if (!data || data.noData || data.segments.length === 0) return [];
    return (data.dropOffPoints || []).map(dp => ({
      timestamp: dp.timestamp,
      severity: dp.severity,
    }));
  }, [data]);

  if (!isOpen) return null;

  const scoreColor = (data?.engagementScore ?? 0) >= 70 ? '#10b981' : (data?.engagementScore ?? 0) >= 40 ? '#eab308' : '#ef4444';

  const cachedDateStr = data?.cachedAt
    ? new Date(data.cachedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  };

  const modalStyle: React.CSSProperties = {
    background: '#1e1e1e', border: '1px solid #333', borderRadius: 16,
    width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto',
    padding: 24, position: 'relative', fontFamily: 'Inter, sans-serif',
  };

  const statBoxStyle: React.CSSProperties = {
    background: '#141414', border: '1px solid #333', borderRadius: 10,
    padding: '10px 8px', textAlign: 'center', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>📊 Retenção do Vídeo</h3>
            <p style={{ color: '#888', fontSize: 12, margin: '4px 0 0' }}>{pageName}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                background: 'rgba(117,251,198,0.1)', border: '1px solid rgba(117,251,198,0.3)',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                color: '#75fbc6', fontSize: 12, fontWeight: 600,
                opacity: syncing ? 0.5 : 1,
              }}
            >
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                color: '#888', fontSize: 14, fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <p style={{ fontSize: 13 }}>Carregando dados de retenção...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <XCircle size={36} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
            <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {/* No Data */}
        {!loading && !error && data?.noData && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BarChart3 size={36} style={{ color: '#555', margin: '0 auto 8px' }} />
            <p style={{ color: '#888', fontSize: 13 }}>{data.message}</p>
            <p style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Os dados aparecem conforme os visitantes assistem ao vídeo.</p>
          </div>
        )}

        {/* Chart + Stats */}
        {!loading && !error && data && !data.noData && data.segments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Engagement Score */}
              <div style={statBoxStyle}>
                <div style={{ position: 'relative', width: 40, height: 40, marginBottom: 4 }}>
                  <svg width={40} height={40} style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 40 40">
                    <circle cx={20} cy={20} r={17} fill="none" stroke="#333" strokeWidth={3} />
                    <circle cx={20} cy={20} r={17} fill="none" stroke={scoreColor} strokeWidth={3}
                      strokeDasharray={`${(data.engagementScore / 100) * 106.8} 106.8`} strokeLinecap="round" />
                  </svg>
                  <span style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900, color: scoreColor,
                  }}>
                    {data.engagementScore}
                  </span>
                </div>
                <p style={{ color: '#666', fontSize: 9, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, margin: 0 }}>Engajamento</p>
              </div>

              {/* Duration */}
              <div style={statBoxStyle}>
                <Clock size={14} style={{ color: '#38bdf8', marginBottom: 4 }} />
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{formatDuration(data.videoDuration)}</span>
                <p style={{ color: '#666', fontSize: 9, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, margin: 0 }}>Duração</p>
              </div>

              {/* Viewers */}
              <div style={statBoxStyle}>
                {data.uniqueViewers ? (
                  <>
                    <BarChart3 size={14} style={{ color: '#38bdf8', marginBottom: 4 }} />
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{data.uniqueViewers.toLocaleString('pt-BR')}</span>
                    <p style={{ color: '#666', fontSize: 9, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, margin: 0 }}>Viewers</p>
                  </>
                ) : (
                  <>
                    <TrendingDown size={14} style={{ color: data.dropOffPoints.length > 0 ? '#f97316' : '#10b981', marginBottom: 4 }} />
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{data.dropOffPoints.length}</span>
                    <p style={{ color: '#666', fontSize: 9, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, margin: 0 }}>Quedas</p>
                  </>
                )}
              </div>
            </div>

            {/* Cache date */}
            {cachedDateStr && (
              <div style={{
                background: '#141414', border: '1px solid #333', borderRadius: 10,
                padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, color: '#888',
              }}>
                <Database size={13} style={{ color: '#75fbc6' }} />
                <span>Última sincronização: {cachedDateStr}</span>
              </div>
            )}

            {/* Area Chart */}
            <div style={{ background: '#141414', border: '1px solid #333', borderRadius: 12, padding: 16 }}>
              <h4 style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>Curva de Retenção</h4>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.segments} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#75fbc6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#75fbc6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: '#666', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#333' }}
                    interval={Math.max(0, Math.floor(data.segments.length / 8))}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#666', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {referenceLines.map((rl, i) => (
                    <ReferenceLine
                      key={i}
                      x={rl.timestamp}
                      stroke={rl.severity === 'critical' ? '#ef4444' : '#eab308'}
                      strokeDasharray="6 3"
                      strokeWidth={2}
                    />
                  ))}
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#75fbc6"
                    strokeWidth={2}
                    fill="url(#retentionGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#75fbc6', stroke: '#000', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Drop-off Points */}
            {data.dropOffPoints.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h4 style={{ color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingDown size={13} style={{ color: '#f97316' }} />
                  Pontos de Queda Detectados
                </h4>
                {data.dropOffPoints.map((dp, i) => (
                  <div key={i} style={{
                    background: dp.severity === 'critical' ? 'rgba(239,68,68,0.05)' : 'rgba(234,179,8,0.05)',
                    border: `1px solid ${dp.severity === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
                      {dp.severity === 'critical' ? '🔴' : '🟡'} {dp.timestamp}
                    </span>
                    <span style={{ color: dp.severity === 'critical' ? '#ef4444' : '#eab308', fontSize: 12, fontWeight: 700 }}>
                      -{dp.drop}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
