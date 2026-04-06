import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Save, Trash2 } from 'lucide-react';

interface DeletePageModalProps {
  isOpen: boolean;
  pageName: string;
  onDeleteOnly: () => void;
  onSaveAndDelete: (templateName: string) => void;
  onCancel: () => void;
}

export default function DeletePageModal({
  isOpen, pageName, onDeleteOnly, onSaveAndDelete, onCancel,
}: DeletePageModalProps) {
  const [step, setStep] = useState<'ask' | 'name'>('ask');
  const [templateName, setTemplateName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!templateName.trim()) return;
    onSaveAndDelete(templateName.trim());
    setStep('ask');
    setTemplateName('');
  };

  const handleCancel = () => {
    setStep('ask');
    setTemplateName('');
    onCancel();
  };

  const handleDeleteOnly = () => {
    setStep('ask');
    setTemplateName('');
    onDeleteOnly();
  };

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        }}
        onClick={handleCancel}
      />
      <div style={{
        position: 'relative', background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-large)',
        padding: '28px 32px', maxWidth: 460, width: '90%',
        animation: 'card-enter 0.25s cubic-bezier(.16,1,.3,1) both',
      }}>
        {step === 'ask' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,107,107,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ff6b6b',
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  Deletar "{pageName}"
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                  Deseja salvar esta página como modelo antes de deletá-la? Assim, você poderá reutilizá-la no futuro.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { setTemplateName(pageName); setStep('name'); }} style={{
                padding: '12px 16px', borderRadius: 'var(--radius-small)',
                border: '1px solid rgba(117,251,198,0.3)', background: 'rgba(117,251,198,0.06)',
                color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.9rem',
                fontWeight: 600, fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Save size={16} /> Salvar como modelo e deletar
              </button>
              <button onClick={handleDeleteOnly} style={{
                padding: '12px 16px', borderRadius: 'var(--radius-small)',
                border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.06)',
                color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem',
                fontWeight: 600, fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Trash2 size={16} /> Deletar sem salvar
              </button>
              <button onClick={handleCancel} style={{
                padding: '10px 16px', borderRadius: 'var(--radius-small)',
                border: '1px solid var(--color-border)', background: 'transparent',
                color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.85rem',
                fontFamily: 'var(--font-body)',
              }}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Salvar como modelo
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 6 }}>
                Dê um nome para o modelo. Você poderá reutilizá-lo na página de <strong>Modelos</strong>.
              </p>
            </div>
            <input
              autoFocus
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Ex: Landing V1, Black Friday 2026..."
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-small)',
                border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.04)',
                color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'var(--font-body)', marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('ask')} style={{
                padding: '10px 20px', borderRadius: 'var(--radius-small)',
                border: '1px solid var(--color-border)', background: 'transparent',
                color: 'var(--color-text-secondary)', cursor: 'pointer',
                fontSize: '0.88rem', fontFamily: 'var(--font-body)', fontWeight: 500,
              }}>
                Voltar
              </button>
              <button onClick={handleSave} disabled={!templateName.trim()} style={{
                flex: 1, padding: '10px 20px', borderRadius: 'var(--radius-small)',
                border: 'none', background: templateName.trim() ? 'var(--color-accent)' : 'rgba(117,251,198,0.3)',
                color: 'var(--color-bg-primary)', cursor: templateName.trim() ? 'pointer' : 'not-allowed',
                fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Save size={16} /> Salvar e Deletar
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
