import { useState, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { useEdit } from '../../context/EditContext';
import TextEditModal from './TextEditModal';

interface EditableTextProps {
  fieldKey: string;
  label?: string;
  children: ReactNode;
  html?: boolean;
  /** If provided, overrides the default save behavior */
  onCustomSave?: (value: string) => void;
  /** If provided, use this as the current value instead of reading from edit context */
  customValue?: string;
}

export default function EditableText({ fieldKey, label, children, html, onCustomSave, customValue }: EditableTextProps) {
  const edit = useEdit();
  const [showModal, setShowModal] = useState(false);
  const [hover, setHover] = useState(false);

  if (!edit?.isEditing) return <>{children}</>;

  const currentValue = customValue ?? edit.content[fieldKey] ?? '';

  return (
    <>
      <div
        style={{
          position: 'relative', cursor: 'pointer',
          outline: hover ? '2px dashed rgba(117,251,198,0.5)' : '2px dashed transparent',
          outlineOffset: 4, borderRadius: 4, transition: 'outline 200ms ease',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(true); }}
      >
        {children}
        {hover && (
          <div style={{
            position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 6,
            background: '#75fbc6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10,
          }}>
            <Pencil size={12} color="#1a1a1a" />
          </div>
        )}
      </div>

      <TextEditModal
        isOpen={showModal}
        fieldLabel={label || fieldKey}
        value={currentValue}
        allowHtml={html}
        onSave={(val) => {
          if (onCustomSave) {
            onCustomSave(val);
          } else {
            edit.updateField(fieldKey, val);
          }
          setShowModal(false);
        }}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

