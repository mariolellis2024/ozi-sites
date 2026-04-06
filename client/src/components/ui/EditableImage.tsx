import { useRef, useState, type ReactNode } from 'react';
import { Camera } from 'lucide-react';
import { useEdit } from '../../context/EditContext';
import toast from 'react-hot-toast';

interface EditableImageProps {
  fieldKey: string;
  children: ReactNode;
}

export default function EditableImage({ fieldKey, children }: EditableImageProps) {
  const edit = useEdit();
  const fileRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!edit?.isEditing) return <>{children}</>;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await edit.uploadImage(fieldKey, file);
      toast.success('Imagem atualizada!');
    } catch {
      toast.error('Erro no upload');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div
      style={{ position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileRef.current?.click(); }}
    >
      {children}

      {/* Hover overlay */}
      {(hover || uploading) && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: uploading ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, transition: 'all 200ms ease', zIndex: 10,
          border: '2px dashed rgba(117,251,198,0.5)',
        }}>
          {uploading ? (
            <>
              <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#75fbc6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Enviando...</span>
            </>
          ) : (
            <>
              <Camera size={24} color="#75fbc6" />
              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Trocar</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
