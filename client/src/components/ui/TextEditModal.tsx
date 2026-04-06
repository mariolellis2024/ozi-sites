import { createPortal } from 'react-dom';
import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface TextEditModalProps {
  isOpen: boolean;
  fieldLabel: string;
  value: string;
  allowHtml?: boolean;
  onSave: (value: string) => void;
  onClose: () => void;
}

export default function TextEditModal({ isOpen, fieldLabel, value, allowHtml, onSave, onClose }: TextEditModalProps) {
  const [text, setText] = useState(value);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10002,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 32, maxWidth: 560, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Editar Conteúdo</h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{fieldLabel}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            width: '100%', minHeight: 120, padding: 16, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
            color: '#fff', fontSize: '0.95rem', lineHeight: 1.6, outline: 'none',
            resize: 'vertical', fontFamily: allowHtml ? 'monospace' : 'inherit',
            boxSizing: 'border-box',
          }}
          autoFocus
        />

        {allowHtml && (
          <p style={{ fontSize: '0.75rem', color: 'rgba(117,251,198,0.6)', marginTop: 8 }}>
            💡 Aceita HTML: use &lt;span class="accent"&gt;texto&lt;/span&gt; para destaque verde
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
          }}>Cancelar</button>
          <button onClick={() => onSave(text)} style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: '#75fbc6', color: '#1a1a1a', cursor: 'pointer', fontSize: '0.9rem',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif',
          }}><Save size={14} /> Salvar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
