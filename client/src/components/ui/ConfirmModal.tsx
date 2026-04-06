import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen, title, message, confirmText = 'Confirmar',
  cancelText = 'Cancelar', danger = false, onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

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
        onClick={onCancel}
      />
      <div style={{
        position: 'relative', background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-large)',
        padding: '28px 32px', maxWidth: 420, width: '90%',
        animation: 'card-enter 0.25s cubic-bezier(.16,1,.3,1) both',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: danger ? 'rgba(255,107,107,0.12)' : 'rgba(117,251,198,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#ff6b6b' : 'var(--color-accent)',
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 20px', borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-border)', background: 'transparent',
            color: 'var(--color-text-secondary)', cursor: 'pointer',
            fontSize: '0.88rem', fontFamily: 'var(--font-body)', fontWeight: 500,
          }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={{
            padding: '10px 20px', borderRadius: 'var(--radius-small)',
            border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
            fontFamily: 'var(--font-body)',
            background: danger ? '#ff6b6b' : 'var(--color-accent)',
            color: danger ? '#fff' : 'var(--color-bg-primary)',
          }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
