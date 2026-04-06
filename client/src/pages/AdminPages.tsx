import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, KeyRound, Plus, ExternalLink, Pencil, Trash2, Shield, BarChart3, LayoutTemplate } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../components/ui/ConfirmModal';

interface Page {
  id: number;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

function AdminNav({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/images/logo.webp" alt="Alanis" style={{ height: 28 }} />
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

function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <Shield size={18} />, path: '/admin/dashboard' },
    { id: 'pages', label: 'Páginas', icon: <FileText size={18} />, path: '/admin/pages' },
    { id: 'template', label: 'Modelo Base', icon: <LayoutTemplate size={18} />, path: '/admin/template' },
    { id: 'integrations', label: 'Integrações', icon: <BarChart3 size={18} />, path: '/admin/integrations' },
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
          color: active === item.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          border: 'none', borderRight: active === item.id ? '2px solid var(--color-accent)' : '2px solid transparent',
          fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left',
          transition: 'all 200ms ease', fontFamily: 'var(--font-body)',
        }}>{item.icon} {item.label}</button>
      ))}
    </nav>
  );
}

export { AdminNav, AdminSidebar };

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { navigate('/admin'); return; }
      setPages(await res.json());
    } catch { toast.error('Erro ao carregar páginas'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, slug: newSlug }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Página criada!');
      setShowCreate(false);
      setNewName('');
      setNewSlug('');
      fetchPages();
    } catch { toast.error('Erro ao criar página'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/pages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Página deletada');
      setDeleteTarget(null);
      fetchPages();
    } catch { toast.error('Erro ao deletar'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="pages" />

        <main style={{ flex: 1, padding: 32 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Páginas</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Gerencie suas landing pages
              </p>
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Nova Página
            </button>
          </div>

          {/* Pages table */}
          {loading ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Carregando...</p>
          ) : pages.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 60, borderRadius: 'var(--radius-medium)',
              border: '1px dashed var(--color-border)', color: 'var(--color-text-light)',
            }}>
              <FileText size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p>Nenhuma página criada ainda</p>
            </div>
          ) : (
            <div style={{ borderRadius: 'var(--radius-medium)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)' }}>
                    {['Nome', 'Slug', 'Status', 'Criado em', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pages.map(page => (
                    <tr key={page.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{page.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <code style={{ background: 'rgba(117,251,198,0.08)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 4, fontSize: '0.85rem' }}>/{page.slug}</code>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: page.status === 'active' ? 'rgba(117,251,198,0.12)' : 'rgba(255,200,50,0.12)',
                          color: page.status === 'active' ? 'var(--color-accent)' : '#ffc832',
                          padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600,
                        }}>{page.status === 'active' ? 'Ativo' : 'Rascunho'}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {new Date(page.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => navigate(`/admin/pages/${page.id}/visual/index`)} title="Editar Landing Page" style={{
                            padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(117,251,198,0.25)',
                            background: 'rgba(117,251,198,0.06)', color: 'var(--color-accent)', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4,
                          }}><Pencil size={12} /> Index</button>
                          <button onClick={() => navigate(`/admin/pages/${page.id}/visual/obrigado`)} title="Editar Página de Obrigado" style={{
                            padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(117,251,198,0.25)',
                            background: 'rgba(117,251,198,0.06)', color: 'var(--color-accent)', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4,
                          }}><Pencil size={12} /> Obrigado</button>
                          <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" title="Abrir" style={{
                            padding: '6px 8px', borderRadius: 6, border: '1px solid var(--color-border)',
                            background: 'transparent', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
                          }}><ExternalLink size={14} /></a>
                          <button onClick={() => setDeleteTarget({ id: page.id, name: page.name })} title="Deletar" style={{
                            padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(255,107,107,0.3)',
                            background: 'transparent', color: '#ff6b6b', cursor: 'pointer',
                          }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCreate(false)} />
          <div style={{
            position: 'relative', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-large)', padding: 32, maxWidth: 440, width: '90%',
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>Nova Página</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Nome</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="ex: Edição de Vídeo" style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                  background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>Slug</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRight: 'none', borderRadius: 'var(--radius-small) 0 0 var(--radius-small)', fontSize: '0.85rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>
                    site.ozi.com.br/
                  </span>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required placeholder="edicao" style={{
                    flex: 1, padding: '12px 16px', borderRadius: '0 var(--radius-small) var(--radius-small) 0', border: '1px solid var(--color-border)',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-small)', border: '1px solid var(--color-border)',
                  background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-body)',
                }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar Página</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Deletar página"
        message={`Tem certeza que deseja deletar "${deleteTarget?.name}"? Esta ação é irreversível.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        danger
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
