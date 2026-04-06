import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { EditProvider } from '../context/EditContext';
import Home from './Home';
import DynamicObrigadoVisual from './DynamicObrigadoVisual';

interface PageData {
  id: number;
  name: string;
  slug: string;
  content_index: Record<string, any>;
  content_obrigado: Record<string, any>;
}

export default function VisualEditor() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetch(`/api/pages/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setPage(data); setLoading(false); })
      .catch(() => navigate('/admin/pages'));
  }, [id, token, navigate]);

  if (loading || !page) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#75fbc6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const isIndex = type === 'index';
  const content = isIndex ? page.content_index : page.content_obrigado;

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#202020', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />

      {/* Toolbar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 56,
        background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/admin/pages')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
          }}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{page.name}</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20,
          background: isIndex ? 'rgba(117,251,198,0.1)' : 'rgba(117,251,198,0.1)',
          border: '1px solid rgba(117,251,198,0.2)',
        }}>
          {isIndex ? <FileText size={14} color="#75fbc6" /> : <CheckCircle size={14} color="#75fbc6" />}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#75fbc6' }}>
            Editando {isIndex ? 'Landing Page' : 'Página de Obrigado'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
          💡 Clique em textos ou imagens para editar
        </div>
      </div>

      {/* Page content with edit mode */}
      <div style={{ paddingTop: 56 }}>
        <EditProvider pageId={page.id} pageType={isIndex ? 'index' : 'obrigado'} initialContent={content}>
          {isIndex ? (
            <Home dynamicContent={{ content_index: content as any }} />
          ) : (
            <DynamicObrigadoVisual content={content as any} />
          )}
        </EditProvider>
      </div>
    </div>
  );
}
