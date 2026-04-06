import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Eye, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AdminNav, AdminSidebar } from './AdminPages';
import TemplatePreviewModal from '../components/ui/TemplatePreviewModal';

interface BaseTemplate {
  id: number;
  name: string;
  description: string;
  content_index: Record<string, any>;
  content_obrigado: Record<string, any>;
  created_at: string;
}

export default function AdminTemplate() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const [templates, setTemplates] = useState<BaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Preview
  const [previewTemplate, setPreviewTemplate] = useState<BaseTemplate | null>(null);
  const [previewType, setPreviewType] = useState<'index' | 'obrigado'>('index');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/base-templates', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setTemplates(await res.json());
    } catch { toast.error('Erro ao carregar templates'); }
    finally { setLoading(false); }
  };

  const openPreview = (tpl: BaseTemplate, type: 'index' | 'obrigado') => {
    setPreviewTemplate(tpl);
    setPreviewType(type);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin'); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <AdminNav email={user.email} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar active="template" />

        <main style={{ flex: 1, padding: 32 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Templates</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Templates de design usados como base ao criar novas páginas. Visualize o preview de cada um.
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
                Nenhum template cadastrado
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {templates.map(tpl => (
                <div key={tpl.id} style={{
                  borderRadius: 'var(--radius-medium)',
                  border: '1px solid rgba(117,251,198,0.25)',
                  background: 'var(--color-bg-secondary)', overflow: 'hidden',
                }}>
                  {/* Card header */}
                  <div style={{ padding: '24px 24px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: 'rgba(117,251,198,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent)',
                      }}>
                        <Copy size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                          {tpl.name}
                        </h3>
                        {tpl.description && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', margin: '3px 0 0' }}>
                            {tpl.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                      <Calendar size={11} /> {formatDate(tpl.created_at)}
                    </div>
                  </div>

                  {/* Preview buttons */}
                  <div style={{
                    display: 'flex', gap: 8, padding: '12px 24px 16px',
                    borderTop: '1px solid var(--color-border)',
                    background: 'rgba(0,0,0,0.1)',
                  }}>
                    <button onClick={() => openPreview(tpl, 'index')} style={{
                      flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-small)',
                      border: '1px solid rgba(117,251,198,0.25)', background: 'rgba(117,251,198,0.06)',
                      color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.82rem',
                      fontWeight: 600, fontFamily: 'var(--font-body)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <Eye size={14} /> Preview Index
                    </button>
                    <button onClick={() => openPreview(tpl, 'obrigado')} style={{
                      flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-small)',
                      border: '1px solid rgba(117,180,251,0.25)', background: 'rgba(117,180,251,0.06)',
                      color: '#75b4fb', cursor: 'pointer', fontSize: '0.82rem',
                      fontWeight: 600, fontFamily: 'var(--font-body)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <Eye size={14} /> Preview Obrigado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        templateId={previewTemplate?.id || 0}
        templateName={previewTemplate?.name || ''}
        previewType={previewType}
        source="base"
      />
    </div>
  );
}
