import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Trash2, RotateCcw, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';
import ConfirmModal from '../components/ui/ConfirmModal';

interface Template {
  id: number;
  name: string;
  content_index: Record<string, any>;
  content_obrigado: Record<string, any>;
  created_at: string;
}

export default function AdminModels() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Template | null>(null);
  const [restoreName, setRestoreName] = useState('');
  const [restoreSlug, setRestoreSlug] = useState('');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setTemplates(await res.json());
    } catch { toast.error('Erro ao carregar modelos'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/templates/${deleteTarget.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Modelo deletado');
      setDeleteTarget(null);
      fetchTemplates();
    } catch { toast.error('Erro ao deletar'); }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreTarget) return;
    try {
      const res = await fetch(`/api/templates/${restoreTarget.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: restoreName, slug: restoreSlug }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Página restaurada a partir do modelo!');
      setRestoreTarget(null);
      navigate('/admin/pages');
    } catch { toast.error('Erro ao restaurar'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-small)',
    border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="models" />

        <main style={{ flex: 1, padding: 32 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Modelos Salvos</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Páginas salvas como modelo antes de serem deletadas. Restaure quando quiser.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-light)' }}>Carregando...</div>
          ) : templates.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 32px',
              borderRadius: 'var(--radius-medium)', border: '1px dashed var(--color-border)',
              background: 'var(--color-bg-secondary)',
            }}>
              <Copy size={40} style={{ color: 'var(--color-text-light)', marginBottom: 12 }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Nenhum modelo salvo
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: 4 }}>
                Quando você deletar uma página e escolher "Salvar como modelo", ela aparecerá aqui.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {templates.map(tpl => (
                <div key={tpl.id} style={{
                  borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)', overflow: 'hidden',
                }}>
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(117,251,198,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent)',
                      }}>
                        <Copy size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tpl.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 2 }}>
                          <Calendar size={11} /> {formatDate(tpl.created_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                      {Object.keys(tpl.content_index || {}).length} campos index • {Object.keys(tpl.content_obrigado || {}).length} campos obrigado
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', gap: 8, padding: '12px 24px',
                    borderTop: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.15)',
                  }}>
                    <button onClick={() => { setRestoreTarget(tpl); setRestoreName(tpl.name); setRestoreSlug(tpl.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} style={{
                      flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-small)',
                      border: '1px solid rgba(117,251,198,0.3)', background: 'rgba(117,251,198,0.06)',
                      color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.82rem',
                      fontWeight: 600, fontFamily: 'var(--font-body)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <RotateCcw size={13} /> Restaurar
                    </button>
                    <button onClick={() => setDeleteTarget(tpl)} style={{
                      padding: '8px 12px', borderRadius: 'var(--radius-small)',
                      border: '1px solid rgba(255,107,107,0.3)', background: 'transparent',
                      color: '#ff6b6b', cursor: 'pointer', fontSize: '0.82rem',
                      fontFamily: 'var(--font-body)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete Template Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Deletar modelo"
        message={`Tem certeza que deseja deletar o modelo "${deleteTarget?.name}"? Esta ação é irreversível.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Restore Modal */}
      {restoreTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setRestoreTarget(null)} />
          <div style={{
            position: 'relative', background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-large)',
            padding: '28px 32px', maxWidth: 460, width: '90%',
            animation: 'card-enter 0.25s cubic-bezier(.16,1,.3,1) both',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px' }}>
              Restaurar "{restoreTarget.name}"
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Uma nova página será criada com todo o conteúdo deste modelo.
            </p>
            <form onSubmit={handleRestore}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>
                  Nome da Página
                </label>
                <input value={restoreName} onChange={e => setRestoreName(e.target.value)} style={inputStyle} autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>
                  Slug (URL)
                </label>
                <input
                  value={restoreSlug}
                  onChange={e => setRestoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setRestoreTarget(null)} style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-border)', background: 'transparent',
                  color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.88rem',
                  fontFamily: 'var(--font-body)',
                }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={16} /> Restaurar como Página
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
