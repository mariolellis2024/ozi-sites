import { useState } from 'react';
import { X, Eye, Monitor, Smartphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templateId: number | string;
  templateName: string;
  previewType: 'index' | 'obrigado';
  source?: 'base' | 'saved';  // 'base' = base_templates, 'saved' = page_templates
}

export default function TemplatePreviewModal({ isOpen, onClose, templateId, templateName, previewType, source = 'saved' }: Props) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const previewUrl = `/admin/preview/template/${source}/${templateId}/${previewType}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '95vw', height: '92vh', maxWidth: 1400,
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-large)', overflow: 'hidden',
        animation: 'card-enter 0.25s cubic-bezier(.16,1,.3,1) both',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', borderBottom: '1px solid var(--color-border)',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eye size={16} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Preview: {templateName}
            </span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              background: previewType === 'index' ? 'rgba(117,251,198,0.12)' : 'rgba(117,180,251,0.12)',
              color: previewType === 'index' ? 'var(--color-accent)' : '#75b4fb',
              letterSpacing: '0.5px',
            }}>
              {previewType === 'index' ? 'Landing Page' : 'Obrigado'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Device toggle */}
            <div style={{
              display: 'flex', gap: 0, borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-border)', overflow: 'hidden',
            }}>
              {[
                { id: 'desktop' as const, icon: <Monitor size={14} /> },
                { id: 'mobile' as const, icon: <Smartphone size={14} /> },
              ].map(d => (
                <button key={d.id} onClick={() => setDevice(d.id)} style={{
                  padding: '6px 12px', border: 'none', cursor: 'pointer',
                  background: device === d.id ? 'rgba(117,251,198,0.15)' : 'transparent',
                  color: device === d.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  display: 'flex', alignItems: 'center',
                }}>
                  {d.icon}
                </button>
              ))}
            </div>

            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', color: 'var(--color-text-secondary)',
              cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center',
            }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview iframe */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#111', padding: device === 'mobile' ? '16px' : 0,
        }}>
          <iframe
            src={previewUrl}
            title={`Preview ${templateName}`}
            style={{
              width: device === 'mobile' ? 390 : '100%',
              height: device === 'mobile' ? '100%' : '100%',
              border: device === 'mobile' ? '1px solid var(--color-border)' : 'none',
              borderRadius: device === 'mobile' ? 12 : 0,
              background: 'var(--color-bg-primary)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
