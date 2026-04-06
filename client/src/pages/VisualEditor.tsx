import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, CreditCard, X, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { EditProvider, useEdit } from '../context/EditContext';
import Home from './Home';
import DynamicObrigadoVisual from './DynamicObrigadoVisual';

interface PageData {
  id: number;
  name: string;
  slug: string;
  content_index: Record<string, any>;
  content_obrigado: Record<string, any>;
}

/* ─── Checkout Editor Panel ─── */
function CheckoutPanel({ onClose }: { onClose: () => void }) {
  const edit = useEdit()!;
  const [pix_link, setPixLink] = useState(edit.content.pix_link || '');
  const [pix_price, setPixPrice] = useState(edit.content.pix_price || '');
  const [pix_detail, setPixDetail] = useState(edit.content.pix_detail || '');
  const [card_link, setCardLink] = useState(edit.content.card_link || '');
  const [card_price, setCardPrice] = useState(edit.content.card_price || '');
  const [card_detail, setCardDetail] = useState(edit.content.card_detail || '');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  const save = () => {
    edit.updateField('pix_link', pix_link);
    edit.updateField('pix_price', pix_price);
    edit.updateField('pix_detail', pix_detail);
    edit.updateField('card_link', card_link);
    edit.updateField('card_price', card_price);
    edit.updateField('card_detail', card_detail);
    toast.success('Checkout atualizado!');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 56, right: 0, bottom: 0, width: 380, zIndex: 10000,
      background: 'rgba(20,20,20,0.98)', backdropFilter: 'blur(16px)',
      borderLeft: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto',
      padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>Configurar Checkout</h3>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
        }}><X size={18} /></button>
      </div>

      {/* PIX */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#75fbc6' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#75fbc6' }}>Pix</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Link de Checkout</label>
            <input value={pix_link} onChange={e => setPixLink(e.target.value)} style={inputStyle} placeholder="https://pay.cakto.com.br/..." />
          </div>
          <div>
            <label style={labelStyle}>Preço</label>
            <input value={pix_price} onChange={e => setPixPrice(e.target.value)} style={inputStyle} placeholder="R$ 297,00" />
          </div>
          <div>
            <label style={labelStyle}>Detalhe</label>
            <input value={pix_detail} onChange={e => setPixDetail(e.target.value)} style={inputStyle} placeholder="pagamento único — sua pra sempre" />
          </div>
        </div>
      </div>

      {/* CARTÃO */}
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6ea8fe' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6ea8fe' }}>Cartão de Crédito</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Link de Checkout</label>
            <input value={card_link} onChange={e => setCardLink(e.target.value)} style={inputStyle} placeholder="https://pay.cakto.com.br/..." />
          </div>
          <div>
            <label style={labelStyle}>Preço</label>
            <input value={card_price} onChange={e => setCardPrice(e.target.value)} style={inputStyle} placeholder="12x R$ 57,78" />
          </div>
          <div>
            <label style={labelStyle}>Detalhe</label>
            <input value={card_detail} onChange={e => setCardDetail(e.target.value)} style={inputStyle} placeholder="no cartão" />
          </div>
        </div>
      </div>

      <button onClick={save} style={{
        padding: '12px 24px', borderRadius: 8, border: 'none',
        background: '#75fbc6', color: '#1a1a1a', cursor: 'pointer',
        fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'Inter, sans-serif', marginTop: 8,
      }}>
        <Save size={16} /> Salvar Checkout
      </button>
    </div>
  );
}

/* ─── Main Visual Editor ─── */
export default function VisualEditor() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isIndex && (
            <button onClick={() => setCheckoutOpen(!checkoutOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              border: checkoutOpen ? '1px solid rgba(117,251,198,0.4)' : '1px solid rgba(255,255,255,0.15)',
              background: checkoutOpen ? 'rgba(117,251,198,0.1)' : 'transparent',
              color: checkoutOpen ? '#75fbc6' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
            }}>
              <CreditCard size={14} /> Checkout
            </button>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20,
            background: 'rgba(117,251,198,0.1)', border: '1px solid rgba(117,251,198,0.2)',
          }}>
            {isIndex ? <FileText size={14} color="#75fbc6" /> : <CheckCircle size={14} color="#75fbc6" />}
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#75fbc6' }}>
              Editando {isIndex ? 'Landing Page' : 'Página de Obrigado'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
          💡 Clique em textos ou imagens para editar
        </div>
      </div>

      {/* Page content with edit mode */}
      <div style={{ paddingTop: 56 }}>
        <EditProvider pageId={page.id} pageType={isIndex ? 'index' : 'obrigado'} initialContent={content}>
          {isIndex ? (
            <>
              <Home dynamicContent={{ content_index: content as any }} />
              {checkoutOpen && <CheckoutPanel onClose={() => setCheckoutOpen(false)} />}
            </>
          ) : (
            <DynamicObrigadoVisual content={content as any} />
          )}
        </EditProvider>
      </div>
    </div>
  );
}
